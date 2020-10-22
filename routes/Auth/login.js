const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { handleServerError, getUser } = require("../../common/functions")

router.use(express.json())

router.post("/", async (req, res) => {
    try{
       const user = await getUser(req.body.email)
       if(user){
            const result = await bcrypt.compare(req.body.password, user.password)
            if(result){
                const accessToken = generateAccessToken(user)
                res.json({
                    stat: "S",
                    accessToken
                })
                return
            }
            res.json({
                stat: "F",
                message: "invalid password"
            })
            return
       } 
       res.json({
           stat: "F",
           message:"email not registered"
       })
    }
    catch(err){
        handleServerError(res)
    }
})

function generateAccessToken(user){
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    return accessToken
}


module.exports = router