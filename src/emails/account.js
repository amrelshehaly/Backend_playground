const express = require('express')
require('dotenv').config()
// const sgMail = require('@sendgrid/mail')
// const sendgridAPIkey = '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'


// sgMail.setApiKey(sendgridAPIkey)

// const sendWelcomeEmail = (email ,name) =>{
//     sgMail.send({
//         from: 'amr.bookface@gmail.com',
//         to : email,
//         subject : 'This is my first creation',
//         text : `I hope u are well from ${name}`
//     })
// }



const nodemailer = require("nodemailer");


const sendWelcomeMail = (email,name,hash) => {

    let transporter  = nodemailer.createTransport({
        service: 'gmail',
        // port: 587,
        // secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL, // generated ethereal user
          pass: process.env.PASSWORD, // generated ethereal password
        },
      });


      var mailOptions = {
        from: 'amshehaly@gmail.com',
        to: email,
        subject: 'Sending Email using Node.js',
        text: `This email is sent to ${name}, please verify by pressing this link: https://shehaly-studio.herokuapp.com/verify/?val=${hash}`
      };


     transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            throw new Error(error)
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

}




module.exports ={
    sendWelcomeMail
} 

