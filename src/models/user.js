const mongoose = require('mongoose')
const validator = require('validator')

const jwt = require('jsonwebtoken')
const bycrpt = require('bcryptjs')

const schema = new mongoose.Schema({
    name :{
        type: String,
        requires : true,
        trim : true
    },
    age : {
        type : Number,
        default : 0,
        validate(value){
            if(value < 0){
                throw new Error ('Age should be bigger than 0')
            }
        }
    },
    email : {
        type:String,
        required : true,
        lowercase : true,
        unique: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error ('Email is not Valid')
            }
        }
    },
    time : { 

        type : Date, 
        default: Date.now 
    },
    password : {
        type:String,
        required: true,
        trim : true,
        minlenght : 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error ('Password cannot have word password in it')
            }
        }

    },
    tokens:[{
        token : {
            type:String,
            required : true
        }
    }],
    avatar :{
        type: Buffer
    }
})

schema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
}

schema.methods.generateAuthToken = async function () {
    const  user =this;
    const token = jwt.sign({_id : user._id.toString() }, 'Thisissparta')

    user.tokens = user.tokens.concat({token : token})

    // console.log(users.tokens)
    await user.save()
    return token
}

schema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})

    if (!user) {
        throw new Error ('unable to login')
    }

    const isMatch = await bycrpt.compare(password,user.password)

    if (!isMatch) {
        throw new Error ('unable to login')
    }

    return user
}

schema.pre('save', async function(next){
    
    const user = this
    
    if(user.isModified('password')){
        user.password = await bycrpt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', schema)

module.exports = User
