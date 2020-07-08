const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const url = `mongodb+srv://dbUser:${process.env.MONGODB_PASSWORD}@cluster0.rnwa7.mongodb.net/${process.env.MONGODB_USERNAME}?retryWrites=true&w=majority`;
const dbName = 'maze-notepad';

const getDb = (callback = null, failCallback = null) => {

  MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
    if (err) {
      failCallback(err);
    }
    else {
      callback(db, db.db(dbName));
    }
  });
}

module.exports = { getDb };
