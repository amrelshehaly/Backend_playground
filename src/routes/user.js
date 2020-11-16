const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const {sendWelcomeEmail} = require('../emails/account')
const auth = require('../middleware/auth')

const multer = require('multer')


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
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await  user.generateAuthToken()
        res.status(201).send({user , token})
     }catch (e){
        res.status(400).send(e)
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

router.get('/users/:id/avatar', async (req,res)=>{
  try {
    const user = await User.findById(req.params.id)
    // console.log(user.email)

    if(!user || !user.avatar){
      throw new Error('Error getting image')
    }

    res.set('Content-Type','image/jpg')
    res.send(user.avatar)

  } catch (error) {
    res.status(404).send()
  }
})


  module.exports = router