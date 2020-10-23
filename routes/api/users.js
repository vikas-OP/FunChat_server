const express = require("express")
const mongodb = require("mongodb")
const router = express.Router()
const {
  connectToDB,
  handleServerError,
  verifyToken,
} = require("../../common/functions")

router.use(express.json())
router.use(verifyToken)

router.get("/rooms", async (req, res) => {
  try {
    const rooms = await getRoomsOfUser(req.body.user._id)
    res.json({
      stat: "S",
      rooms,
    })
  } catch (err) {
    handleServerError(res)
  }
})

router.put("/:id", async (req, res) => {
  try {
    await updateUsername(req.params.id, req.body.userName)
    res.json({
      message: "username updated, login again",
    })
  } catch (err) {
    handleServerError(res)
  }
})

async function getRoomsOfUser(userID) {
  const rooms = await connectToDB(async (db) => {
    const rooms = await db
      .collection("rooms")
      .find({ userID: mongodb.ObjectID(userID) })
      .project({ _id: 1, name: 1, userID: 1 })
      .toArray()
    return rooms
  })
  return rooms
}

async function updateUsername(id, userName) {
  await connectToDB(async (db) => {
    await db
      .collection("users")
      .findOneAndUpdate({ _id: mongodb.ObjectID(id) }, { $set: { userName } })
  })
}

module.exports = router
