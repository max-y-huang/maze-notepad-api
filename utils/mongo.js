const config = require('./../mongoDbConfig');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const url = `mongodb+srv://dbUser:${config.password}@cluster0.rnwa7.mongodb.net/${config.username}?retryWrites=true&w=majority`;
const dbName = 'maze-notepad';

const getDb = () => {

  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
      if (err) {
        reject(error);
      }
      resolve({ db: db, dbo: db.db(dbName) });
    });
  });
}

module.exports = { getDb };
