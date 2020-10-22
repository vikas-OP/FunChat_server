const express = require("express")
const router = express.Router()
const { handleServerError, verifyToken } = require("../../common/functions")

router.use(express.json())
router.use(verifyToken)

router.get("/", async (req, res) => {
  try {
    res.json({
      stat: "S",
      user: {
        userName: req.body.user.userName,
        id: req.body.user._id,
      },
    })
  } catch (err) {
    handleServerError(res)
  }
})

module.exports = router
