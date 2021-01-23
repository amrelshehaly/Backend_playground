const express = require('express')
const router = new express.Router()
const passport = require('passport')
const isLoogedIn = require('./google-middleware')
const auth = require('../middleware/auth')
const cookieSession = require('cookie-session')

require('../passport-setup/google-passport')

router.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
  }))

router.use(passport.initialize());
router.use(passport.session());



router.get('/failed', (req,res)=>{
    res.send('you failed to login')
})

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',  passport.authenticate('google', { failureRedirect: '/failed' }),
 function(req, res) {
  // Successful authentication, redirect home.

    if(req.user){
        // console.log(req)
        res.status(200).send({ user :req.user.user , token : req.user.token})
    }else{
        res.status(404).send("NO USER IS THERE")
    }
  
});

router.get('/google/logout', async (req,res)=>{
    console.log(req.headers.authorization)
    req.session = null
    await req.logout()
    res.redirect('/')
})


module.exports = router