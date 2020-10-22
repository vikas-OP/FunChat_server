const express = require("express")
const router = express.Router()
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const {handleServerError, getUser, getUserByUserName, sendActivationMail, registerUser} = require("../../common/functions")

router.use(express.json())

router.post("/", async (req, res) => {
    try{
        let user = await getUser(req.body.email)
        if(user){
            res.json({
                stat: "F",
                message:"user already registered"
            })
            return
        }
        user = await getUserByUserName(req.body.userName)
        if(user){
            res.json({
                stat: "F",
                message: "username already taken"
            })
            return
        }
        const activationLink = crypto.randomBytes(64).toString("hex")
        sendActivationMail(req.body.email, activationLink)
        const password = await bcrypt.hash(req.body.password, 10)
        user = {
            userName: req.body.userName,
            email: req.body.email,
            password, 
            status: "inactive",
            activationLink
        }
        await registerUser(user)
        res.json({
            stat: "S",
            message: "Activation Link is sent to your email"
        })
    }
    catch(err){
        handleServerError(res)
    }
})


module.exports = router