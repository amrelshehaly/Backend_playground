const mongoose = require('mongoose')

const uri = "mongodb+srv://admin:admin@cluster0.y8uvd.mongodb.net/Database_1?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });

mongoose.connect(uri,
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useCreateIndex:true
    })

    