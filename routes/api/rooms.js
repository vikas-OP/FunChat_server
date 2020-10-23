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
router.use(verifyToken)

router.post("/", async (req, res) => {
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

router.put("/:id", async (req, res) => {
  try {
    const isRoomUpdated = await updateRoomDetails(
      req.params.id,
      req.body.name,
      req.body.accessCode
    )
    if (isRoomUpdated) {
      res.json({
        stat: "S",
        message: "Room Updated",
      })
      return
    }
    res.json({
      stat: "F",
      message: "something went wrong",
    })
  } catch (err) {
    handleServerError(err)
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await deleteRoom(req.params.id)
    res.json({
      stat: "S",
    })
  } catch (err) {
    handleServerError(res)
  }
})

async function createRoom(name, accessCode, userID) {
  const result = await connectToDB(async (db) => {
    const hashAccessCode = await bcrypt.hash(accessCode, 10)
    await db.collection("rooms").insertOne({
      name,
      accessCode: hashAccessCode,
      userID: mongodb.ObjectID(userID),
      users: [],
    })
    const room = await db.collection("rooms").findOne({
      name,
      accessCode: hashAccessCode,
      userID: mongodb.ObjectID(userID),
    })
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

async function deleteRoom(id) {
  await connectToDB(async (db) => {
    await db.collection("rooms").findOneAndDelete({ _id: mongodb.ObjectID(id) })
  })
}

async function updateRoomDetails(id, name, accessCode) {
  try {
    const hashAccessCode = await bcrypt.hash(accessCode, 10)
    await connectToDB(async (db) => {
      await db
        .collection("rooms")
        .findOneAndUpdate(
          { _id: mongodb.ObjectID(id) },
          { $set: { name, accessCode: hashAccessCode } }
        )
    })
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

module.exports = router
