const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const { handleServerError, connectToDB } = require("../../common/functions")

router.use(express.json())

router.post("/", async (req, res) => {
    try{
        const password = await bcrypt.hash(req.body.password, 10)
        const user = await getUserAndUpdate(req.body.resetPasswordLink, password)
        if(user){
            res.json({
                stat: "S",
                message: "password changed"
            })
            return
        }
        res.status(400).json({
            stat: "F",
            message: "invalid link"
        })
    }
    catch(err){
        handleServerError(res)
    }
})

async function getUserAndUpdate(resetPasswordLink, password){
    const isUserPresent = await connectToDB(async (db) => {
        const user = await db.collection("users").findOne({resetPasswordLink})
        if(!user){
            return false
        }
        await db.collection("users").findOneAndUpdate({resetPasswordLink}, {$set: {password}, $unset: {resetPasswordLink : 1}})
        return true
    })
    return isUserPresent
}


module.exports = router