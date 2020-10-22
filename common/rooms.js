const mongodb = require("mongodb")
const { connectToDB } = require("./functions")

async function getUsersOfRoom(id) {
  const users = await connectToDB(async (db) => {
    const room = await db
      .collection("rooms")
      .findOne({ _id: mongodb.ObjectID(id) })
    return room.users
  })
  return users
}

async function addUserToRoom(id, userName) {
  try {
    await connectToDB(async (db) => {
      await db
        .collection("rooms")
        .findOneAndUpdate(
          { _id: mongodb.ObjectID(id) },
          { $push: { users: userName } }
        )
    })
    return true
  } catch (err) {
    return false
  }
}

async function removeUserFromRoom(id, userName) {
  try {
    await connectToDB(async (db) => {
      await db
        .collection("rooms")
        .findOneAndUpdate(
          { _id: mongodb.ObjectID(id) },
          { $pull: { users: userName } }
        )
    })
    return true
  } catch (err) {
    return false
  }
}

module.exports = { getUsersOfRoom, addUserToRoom, removeUserFromRoom }
