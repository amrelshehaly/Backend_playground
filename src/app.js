const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')

require('dotenv').config()

const UserRouter = require('./routes/user')

const app = express()
const port = process.env.PORT || 3000

// const upload = multer({
//   dest:'src/images',
//   limits : {
//     fileSize: 1000000
//   },
//   fileFilter(req,file,callback){

//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return callback(new Error ('Please upload a pdf'))
//     }

//     callback(undefined,true)

//     // callback(new Error ('File must be PDF'))
//     // callback(undefined , true)
//     // callback(undefined, false)

//   }
// })
// app.post('/upload', upload.single('upload'),  (req,res)=>{
//   res.send()
// }, (error,req,res,next)=>{
//   res.status(400).send({'error' : error.message})
// })

app.use(express.json())
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex:true
}).then(()=>{
  console.log("connected to DB")
}).catch((err)=>{
  console.error(`Error connecting to the database. \n${err}`);
});

app.use(UserRouter)

app.listen(port , ()=>{
    console.log('Server is listening to port ,', port)
})