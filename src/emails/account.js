const express = require('express')
const sgMail = require('@sendgrid/mail')
const sendgridAPIkey = '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'


sgMail.setApiKey(sendgridAPIkey)

const sendWelcomeEmail = (email ,name) =>{
    sgMail.send({
        from: 'amr.bookface@gmail.com',
        to : email,
        subject : 'This is my first creation',
        text : `I hope u are well from ${name}`
    })
}

module.exports ={
    sendWelcomeEmail
} 