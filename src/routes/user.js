const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const {sendWelcomeMail} = require('../emails/account')
const auth = require('../middleware/auth')

const multer = require('multer')

const verification = require('../models/verification')
const crypto = require('crypto')


router.get('/users',async (req, res) => {
    const foods = await User.find({});
  
    try {
      res.send(foods);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  router.post('/users' , async (req,res)=>{
    const user = new User (req.body)
     try{
       const rand = crypto.randomBytes(16).toString('hex')
        // await sendWelcomeMail(user.email, user.name , rand)
        const Verification = new verification({_userid: user._id, hash: rand })
        await Verification.save()
        await user.save()
        const token = await  user.generateAuthToken()
        res.status(201).send({user , token})
     }catch (e){
       console.log("Problem signing up")
        res.status(400).send(e)
     }
  })

  router.get('/verify',async(req,res)=>{
    try {
      const hash = req.query.val
      // console.log(hash)

      const code = await verification.findOne({hash: hash})
      // console.log("code:", code)

      if(code){
        res.status(200).send(code)
        await verification.findByIdAndDelete(code._id)
      }
    } catch (error) {
      res.status(404).send("The Expiry time has reached. PLease signup again")
    }
    

  })

  router.post('/users/login',  async (req,res)=>{
      try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()

        // console.log(user)
        res.send({
            user : user,
            token :token
        })

    } catch (error) {
        console.log('cannt login')
        res.status(400).send()
    }
  })

  router.post('/users/logout', auth , async (req,res)=>{

    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth , async (req,res)=>{
    try {
        req.user.tokens = [] 
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me',auth , async (req,res)=>{

    res.send(req.user)
})

router.delete('/users/me', auth, async (req,res)=> {
  try {
      
      // const user = await User.findByIdAndDelete(req.user._id)

      // if (!user) {
      //     res.status(404).send()
      // }

      await req.user.remove()

      res.send(req.user)
  } catch (error) {
      res.status(500).send()
  }
})

router.patch('/users/me',auth,async (req,res)=>{
    const updatings = ['name','age','password','email']
    const body_array = Object.keys(req.body)
    // console.log(body_array)
    const isValid = body_array.every((value)=>{
      return updatings.includes(value)
    })

    if(!isValid){
      return res.status(400).send({'error': 'Invalid Operation'})
    }

    try {
      const user = await User.findById({_id : req.user._id})
      // console.log(req.body)
      body_array.forEach((value)=>{
        user[value] = req.body[value]
      })

      // console.log(user)

      if(!user){
        return res.status(400).send()
      }

      res.status(200).send(user)

    } catch (error) {
      res.status(404).send(error)
    }
})

const upload = multer({
  limits :{
    fileSize:1000000
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return  cb(new Error('PLease enter an Image'))
    }

    cb(undefined,true)

  }
})

router.post('/users/me/avatar', auth ,upload.single('avatar') , async (req,res)=>{
  req.user.avatar =  req.file.buffer
  await req.user.save()
  res.status(200).send()
}, (error,req,res,next)=>{
  res.status(400).send({'error' : error.message})
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
  req.user.avatar = undefined
  await req.user.save()
  res.status(200).send()
})

router.get('/users/avatar', auth , async (req,res)=>{
  try {
    // const user = await User.findById(req.user.id)
    // console.log(user.email)

    if(!req.user || !req.user.avatar){
      throw new Error('Error getting image')
    }

    res.set('Content-Type','image/jpg')
    res.send(req.user.avatar)

  } catch (error) {
    res.status(404).send()
  }
})


  module.exports = router