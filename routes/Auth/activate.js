const express = require("express")
const router = express.Router()
const {handleServerError, connectToDB} = require("../../common/functions")

router.use(express.json())

router.post("/", async (req, res) => {
    try{
        const isUserActivated = await activateUser(req.body.activationLink)
        if(isUserActivated){
            res.json({
                stat: "S",
                message: "user activated"
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

async function activateUser(activationLink){
    const isUserActivated = await connectToDB(async (db) => {
        const user = await db.collection("users").findOne({activationLink})
        if(user){
            await db.collection("users").findOneAndUpdate({activationLink}, {$set: {status: "active"}, $unset: {activationLink: 1}})
            return true
        }
        return false
    })
    return isUserActivated
}


module.exports = router