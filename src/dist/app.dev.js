"use strict";

var express = require('express');

var mongoose = require('mongoose');

var multer = require('multer');

var cors = require('cors');

var path = require('path');

var http = require('http');

var publicDirectoryPath = path.join(__dirname, '../public');

var socketio = require('socket.io');

var Filter = require('bad-words');

var _require = require('./utils/messages'),
    generateMessage = _require.generateMessage;

require('dotenv').config();

var UserRouter = require('./routes/user');

var googleRouter = require('./auth/google-auth'); // const videochatRouter = require('./routes/video-chat')
// var corsOptions = {
//   origin: 'https://upbeat-bohr-db3c71.netlify.app',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }


var app = express(); // app.use(cors())

app.use(express["static"](publicDirectoryPath));
var server = http.createServer(app);
var io = socketio(server);
var port = process.env.PORT || 3000; // const upload = multer({
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

app.use(express.json());
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(function () {
  console.log("connected to DB");
})["catch"](function (err) {
  console.error("Error connecting to the database. \n".concat(err));
});
app.use(UserRouter);
app.use(googleRouter); // app.use(videochatRouter)

io.on('connection', function (socket) {
  console.log("New web Socket connection");
  socket.emit("message", generateMessage('Welcome'));
  socket.broadcast.emit('message', generateMessage("A new User has Joined!!"));
  socket.on('FEmessage', function (msg) {
    console.log(msg);
    socket.broadcast.emit('message-broadcast', msg);
  }); // socket.on('join-room', (roomId, userId) =>{
  //   console.log(roomId, userId)
  //   socket.join(roomId)
  //   socket.to(roomId).broadcast.emit('user-connected', userId)
  // })

  socket.on('sendMessage', function (message, callback) {
    console.log(message);
    var filter = new Filter();

    if (filter.isProfane(message)) {
      return callback(' Profanity is not allowed');
    }

    io.emit('message', message);
    callback();
  });
  socket.on('disconnect', function () {
    io.emit('message', "User has left ");
  });
});
server.listen(port, function () {
  console.log('Server is listening to port ,', port);
});