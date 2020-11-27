const express = require('express')
const router = new express.Router()
const passport = require('passport')
const isLoogedIn = require('./google-middleware')
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

router.get('/good', isLoogedIn ,(req,res)=>{
    // console.log(req.user)
    res.send(`welcome mr ${req.user.name}`)
})


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',  passport.authenticate('google', { failureRedirect: '/failed' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/good');
});

router.get('/google/logout' , async (req,res)=>{
    req.session = null
    await req.logout()
    res.redirect('/bye')
})

router.get('/bye', (req,res)=>{
    res.send('You are now logged out')
})


module.exports = router