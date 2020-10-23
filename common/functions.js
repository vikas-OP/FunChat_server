const mongodb = require("mongodb")
require("dotenv").config()
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

const URL = process.env.DATABASE_URL
const mongoClient = mongodb.MongoClient

async function connectToDB(cb) {
  let client
  try {
    client = await mongoClient.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    const db = client.db("chat_app")
    const result = await cb(db)
    client.close()
    return result
  } catch (err) {
    if (client) {
      client.close()
    }
    throw err
  }
}

async function registerUser(user) {
  await connectToDB(async (db) => {
    await db.collection("users").insertOne(user)
  })
}

function handleServerError(res) {
  res.status(500).json({
    message: "something went wrong",
  })
}

async function getUser(email) {
  const user = await connectToDB(async (db) => {
    const user = await db.collection("users").findOne({ email })
    return user
  })
  return user
}

async function getUserByUserName(userName) {
  const user = await connectToDB(async (db) => {
    const user = await db.collection("users").findOne({ userName })
    return user
  })
  return user
}

function sendActivationMail(email, randomString) {
  const subject = "Activate your account"
  const text = "To activate your account"
  randomString = `activate/${randomString}`
  sendMail(email, randomString, subject, text)
}

function sendPasswordResetMail(email, randomString) {
  const subject = "Reset your account"
  const text = "To reset the password of your account"
  randomString = `reset-password/${randomString}`
  sendMail(email, randomString, subject, text)
}

function sendMail(email, randomString, subject, text) {
  const randomUrl = `https://vikas-funchat.netlify.app/${randomString}`
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  })
  var mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: `${email}`,
    subject: `${subject}`,
    html: `<p>${text} please <a href = ${randomUrl}>click here</a>
        </p>`,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw err
    }
  })
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      res.status(400).json({
        stat: "F",
        message: "invalid token",
      })
      return
    }
    req.body.user = decode
    next()
  })
}

module.exports = {
  handleServerError,
  getUser,
  getUserByUserName,
  sendActivationMail,
  sendPasswordResetMail,
  registerUser,
  connectToDB,
  verifyToken,
}
