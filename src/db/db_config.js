// const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()


const uri = process.env.DATABASE_URL;
// const client = new MongoClient(uri, { useNewUrlParser: true });

// mongoose.connect(uri,
//     {
//         useNewUrlParser: true, 
//         useUnifiedTopology: true, 
//         useCreateIndex:true
//     })


function initialize(
    dbName,
    dbCollectionName,
    successCallback,
    failureCallback
) {
    MongoClient.connect(uri,{useUnifiedTopology: true, useNewUrlParser: true,} ,function(err, dbInstance) {
        if (err) {
            console.log(`[MongoDB connection] ERROR: ${err}`);
            failureCallback(err); // this should be "caught" by the calling function
        } else {
            const dbObject = dbInstance.db(dbName);
            const dbCollection = dbObject.collection(dbCollectionName);
            console.log("[MongoDB connection] SUCCESS");

            successCallback(dbCollection);
        }
    });
}

module.exports = {
    initialize
};