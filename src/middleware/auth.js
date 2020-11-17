const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv').config


const auth = async (req,res, next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ' , '')
        // console.log(token)
        const valid = jwt.verify(token,process.env.JWT_VERIFICATION)
        // console.log("--->",valid)
        const user = await User.findOne({_id: valid._id ,  'tokens.token' : token})

        // console.log(user)

        if(!user){
            throw new Error ()
        }

        req.token = token
        req.user = user
        next()

    } catch (error) {
        res.status(401).send({'error' : 'please auth first'})
    }
}

module.exports = auth