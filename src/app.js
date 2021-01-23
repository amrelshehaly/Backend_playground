const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
var cors = require('cors')
const path = require('path')
const http = require('http')
const publicDirectoryPath = path.join(__dirname,'../public')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } =  require('./utils/messages')

require('dotenv').config()

const UserRouter = require('./routes/user')
const googleRouter = require('./auth/google-auth')


const app = express()
app.use(cors())
app.use(express.static(publicDirectoryPath))

const server = http.createServer(app)
const io = socketio(server)
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
app.use(googleRouter)

io.on('connection',(socket)=>{
  console.log("New web Socket connection")

  socket.emit("message" , generateMessage ('Welcome'))
  socket.broadcast.emit('message', generateMessage("A new User has Joined!!"))

  socket.on('FEmessage',(msg)=>{
    console.log(msg)
    socket.broadcast.emit('message-broadcast',msg)
  })

  socket.on('sendMessage',(message , callback)=>{
    console.log(message)
    const filter = new Filter()

    if(filter.isProfane(message)){
      return callback(' Profanity is not allowed')
    }

    io.emit('message',message)
    callback()
  })

  socket.on('disconnect', ()=>{
    io.emit('message', "User has left ")
  })
  
})


server.listen(port , ()=>{
    console.log('Server is listening to port ,', port)
})