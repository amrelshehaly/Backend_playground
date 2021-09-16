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
// const videochatRouter = require('./routes/video-chat')

// var allowlist = ['https://upbeat-bohr-db3c71.netlify.app', process.env.FRONTDEV_DOMAIN]
// var corsOptionsDelegate = function (req, callback) {
//   var corsOptions;
//   if (allowlist.indexOf(req.header('Origin')) !== -1) {
//     corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false } // disable CORS for this request
//   }
//   callback(null, corsOptions) // callback expects two parameters: error and options
// }

const app = express()
// app.use(cors({origin: 'https://upbeat-bohr-db3c71.netlify.app'}))
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://upbeat-bohr-db3c71.netlify.app');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
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
// app.use(videochatRouter)

io.on('connection',(socket)=>{
  console.log("New web Socket connection")

  socket.emit("message" , generateMessage ('Welcome'))
  socket.broadcast.emit('message', generateMessage("A new User has Joined!!"))

  socket.on('FEmessage',(msg)=>{
    console.log(msg)
    socket.broadcast.emit('message-broadcast',msg)
  })

  // socket.on('join-room', (roomId, userId) =>{
  //   console.log(roomId, userId)
  //   socket.join(roomId)
  //   socket.to(roomId).broadcast.emit('user-connected', userId)
  // })

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