const express = require("express")
const router = express.Router()
const crypto = require("crypto")
const { handleServerError, getUser, sendPasswordResetMail, connectToDB } = require("../../common/functions")

router.use(express.json())

router.post("/", async (req, res) => {
    try{
        const email = req.body.email
        const user = await getUser(email)
        const randomString = crypto.randomBytes(64).toString("hex")
        if(user){
            sendPasswordResetMail(email, randomString)
            updateUserWithResetPasswordLink(email, randomString)
            res.json({
                stat: "S",
                message: "check email to reset password"
            })
            return 
        }
        res.json({
            stat: "F",
            message: "email not registered"
        })
    }
    catch(err){
        handleServerError(res)
    }
})

async function updateUserWithResetPasswordLink(email, resetPasswordLink){
    await connectToDB(async (db) => {
        await db.collection("users").findOneAndUpdate({email}, {$set: {resetPasswordLink}})
    })
}


module.exports = router