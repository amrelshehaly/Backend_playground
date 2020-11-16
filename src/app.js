const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')

// const User = require('./models/user') 
const UserRouter = require('./routes/user')

const app = express()
const port = process.env.PORT || 3000

const upload = multer({
  dest:'src/images',
  limits : {
    fileSize: 1000000
  },
  fileFilter(req,file,callback){

    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return callback(new Error ('Please upload a pdf'))
    }

    callback(undefined,true)

    // callback(new Error ('File must be PDF'))
    // callback(undefined , true)
    // callback(undefined, false)

  }
})
app.post('/upload', upload.single('upload'),  (req,res)=>{
  res.send()
}, (error,req,res,next)=>{
  res.status(400).send({'error' : error.message})
})

app.use(express.json())
mongoose.connect("mongodb+srv://admin:admin@cluster0.y8uvd.mongodb.net/Database_1?retryWrites=true&w=majority", {
  useNewUrlParser: true, 
  useUnifiedTopology: true, 
  useCreateIndex:true
});

app.use(UserRouter)

// const db =  require('./db/db_config')
// const  dbName = "Database_1"
// const collectionName = "users"

// db.initialize(dbName, collectionName, function(dbCollection) { // successCallback
//     // get all items
    
//     dbCollection.insertOne(user, (err,res)=>{
//         if(err){
//             throw err;
//         }
//         dbCollection.find().toArray((_error, _result) => { // callback of find
//             if (_error) throw _error;
//             console.log(_result)
//         });
//     })

//     // << db CRUD routes >>

// }, function(err) { // failureCallback
//     throw (err);
// });
// // client.connectToServer( function( err, client ) {
// //     if (err) console.log(err);
// //     // start the rest of your app here
// //   } );

// const user = {
//     name : "Amr",
//     email: "p@gmail.com",
//     password : "Rl"
// }


// app.post('/users', async (req,res)=>{
//     const user = new User({
//         name : "Amr",
//         email: "a@gmail.com",
//         password : "Red12345!!"
//     })

//     try {
//         await user.save()
//     } catch (error) {
//         console.log(error)
//     }
    
// })

app.listen(port , ()=>{
    console.log('Server is listening to port ,', port)
})