const express = require("express")
const bcrypt = require("bcryptjs")
const mongodb = require("mongodb")
const router = express.Router()
const {
  connectToDB,
  handleServerError,
  verifyToken,
} = require("../../common/functions")

router.use(express.json())
//router.use(verifyToken)

router.post("/", verifyToken, async (req, res) => {
  try {
    const room = await createRoom(
      req.body.name,
      req.body.accessCode,
      req.body.user._id
    )
    res.json({
      stat: "S",
      room,
    })
  } catch (err) {
    handleServerError(res)
  }
})

router.get("/:id", async (req, res) => {
  try {
    const room = await getRoomDetails(req.params.id)
    if (room) {
      res.json({
        stat: "S",
        room,
      })
      return
    }
    res.json({
      stat: "F",
      message: "invalid room id",
    })
  } catch (err) {
    handleServerError(res)
  }
})

async function createRoom(name, accessCode, userID) {
  const result = await connectToDB(async (db) => {
    const hashAccessCode = await bcrypt.hash(accessCode, 10)
    await db
      .collection("rooms")
      .insertOne({ name, accessCode: hashAccessCode, userID, users: [] })
    const room = await db
      .collection("rooms")
      .findOne({ name, accessCode: hashAccessCode, userID })
    return {
      roomID: room._id,
      accessCode,
    }
  })
  return result
}

async function getRoomDetails(id) {
  const room = await connectToDB(async (db) => {
    const room = await db
      .collection("rooms")
      .findOne({ _id: mongodb.ObjectID(id) })
    if (room) {
      return {
        name: room.name,
      }
    }
    return
  })
  return room
}

module.exports = router
