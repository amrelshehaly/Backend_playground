const passport= require('passport')
require('dotenv').config()
const User = require('../models/user')
const crypto = require('crypto')
const verification = require('../models/verification')
const {sendWelcomeMail} = require('../emails/account')



var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    // User.findById(id, function(err, user) {
      done(null, user);
    // });
  });


const UserExist = async (email) =>{
    await User.findOne({email : email}, (err , res) =>{
        try {
            if (res) {
                return res
            }
        } catch (error) {
            throw new Error(error)
        }
    })
}

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
   function (accessToken, refreshToken, profile, done){
     User.findOne({ email: profile.emails[0].value }, async function (err, user) {
        // console.log(profile)
        // console.log("Access Token ->" , accessToken)
        // console.log(user)

        if(!user){
            const rand = crypto.randomBytes(16).toString('hex')
            const user = new User ({
                name : profile.displayName,
                email : profile.emails[0].value,
                password : crypto.randomBytes(16).toString('hex'),
                googleId : profile.id,
                avatar : profile.photos[0].value
            })

            await sendWelcomeMail(user.email, user.name , rand)
            const verify = new verification({_userid: user._id, hash: rand })
            await verify.save()
            await  user.generateAuthToken()
            await user.save()

            return done (null, user)


        }

        return done(null, user);
    });



  }
));

