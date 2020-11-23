const express = require('express')
const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    _userid :{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User'
    },
    hash :{
        type : String,
        required : true
    },
    createdAt :{
        type: Date, 
        required: true, 
        default: Date.now, 
        expires: 43200
    }

})

const Verify = mongoose.model('Verify', userSchema)

module.exports  = Verify