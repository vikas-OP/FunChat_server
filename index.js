const express = require("express")
const socketio = require("socket.io")
const mongodb = require("mongodb")
const http = require("http")
const cors = require("cors")
const bcrypt = require("bcryptjs")
require("dotenv").config()
const register = require("./routes/Auth/register")
const activate = require("./routes/Auth/activate")
const login = require("./routes/Auth/login")
const forgotPassword = require("./routes/Passwords/forgotPassword")
const resetPassword = require("./routes/Passwords/resetPassword")
const home = require("./routes/App/home")
const rooms = require("./routes/api/rooms")
const { connectToDB } = require("./common/functions")
const { addUserToRoom, removeUserFromRoom } = require("./common/rooms")
const {
  formatWelcomingMessage,
  formatUserJoiningMessage,
  formatClientMessage,
  formatMessageForOthers,
  formatUserLeavingMessage,
} = require("./common/messages")

const PORT = process.env.PORT || 5000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

io.use(async (socket, next) => {
  checkRoomCredentials(socket)
    .then((result) => {
      socket.details = { ...result }
      next()
    })
    .catch((err) => {
      next(err)
    })
}).on("connection", (socket) => {
  socket.on("join_room", async (roomID) => {
    socket.join(roomID)
    await addUserToRoom(roomID, socket.details.userName)
    socket.emit(
      "message",
      await formatWelcomingMessage(socket.details.userName, roomID)
    )
    socket.broadcast
      .to(roomID)
      .emit(
        "message",
        await formatUserJoiningMessage(socket.details.userName, roomID)
      )
  })

  socket.on("message", (message) => {
    socket.emit("message", formatClientMessage(message))
    socket.broadcast
      .to(socket.details.roomID)
      .emit("message", formatMessageForOthers(socket.details.userName, message))
  })
  socket.on("disconnect", async () => {
    await removeUserFromRoom(socket.details.roomID, socket.details.userName)
    io.to(socket.details.roomID).emit(
      "message",
      await formatUserLeavingMessage(
        socket.details.userName,
        socket.details.roomID
      )
    )
  })
})

app.use(
  cors({
    origin: "*",
  })
)
app.use("/register", register)
app.use("/activate", activate)
app.use("/login", login)
app.use("/forgot-password", forgotPassword)
app.use("/reset-password", resetPassword)
app.use("/home", home)
app.use("/api/rooms", rooms)

server.listen(PORT, () => console.log("server started"))

// use((socket, next) => {
//   if (socket.handshake.query && socket.handshake.query.token) {
//     verifyToken(socket.handshake.query.token, socket, next)
//   }
//   next(new Error("Authentication error"))
// })

function verifyToken(token, socket, next) {
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return next(err)
    }
    socket.decode = decode
    next()
  })
}

async function checkRoomCredentials(socket) {
  try {
    const result = await connectToDB(async (db) => {
      const room = await db
        .collection("rooms")
        .findOne({ _id: mongodb.ObjectID(socket.handshake.query.roomID) })
      if (room) {
        return await bcrypt.compare(
          socket.handshake.query.accessCode,
          room.accessCode
        )
      } else {
        throw new Error("roomid not valid")
      }
    })
    if (result) {
      return {
        userName: socket.handshake.query.userName,
        roomID: socket.handshake.query.roomID,
      }
    } else {
      throw new Error("wrong access code")
    }
  } catch (err) {
    if (err == "wrong access code" || err == "roomid not valid") {
      throw err
    }
    throw new Error("something went wrong")
  }
}
