const { getUsersOfRoom } = require("./rooms")
const moment = require("moment")

async function formatWelcomingMessage(userName, roomID) {
  const users = await getUsersOfRoom(roomID)
  return {
    sentBy: `DayBot`,
    message: `Welcome ${userName}, let's FunChat`,
    time: moment().utcOffset("+05:30").format("h:mm a"),
    users,
  }
}

async function formatUserJoiningMessage(userName, roomID) {
  const users = await getUsersOfRoom(roomID)
  return {
    sentBy: `DayBot`,
    message: `${userName} has joined the party`,
    time: moment().utcOffset("+05:30").format("h:mm a"),
    users,
  }
}

function formatClientMessage(message) {
  return {
    sentBy: `You`,
    message,
    time: moment().utcOffset("+05:30").format("h:mm a"),
  }
}

function formatMessageForOthers(userName, message) {
  return {
    sentBy: userName,
    message,
    time: moment().utcOffset("+05:30").format("h:mm a"),
  }
}

async function formatUserLeavingMessage(userName, roomID) {
  const users = await getUsersOfRoom(roomID)
  return {
    sentBy: `DayBot`,
    message: `${userName} has left the chat`,
    time: moment().utcOffset("+05:30").format("h:mm a"),
    users,
  }
}

module.exports = {
  formatWelcomingMessage,
  formatUserJoiningMessage,
  formatClientMessage,
  formatMessageForOthers,
  formatUserLeavingMessage,
}
