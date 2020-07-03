const express = require('express');
const router = express.Router();

const mdb = require('./../../utils/mongo');

router.get('/', async (req, res, next) => {

  let { db, dbo } = await mdb.getDb().catch(err => res.status(500).json({ 'result': err }));

  let found = await new Promise((resolve, reject) => {
    dbo.collection('mazes').find({}).toArray((err, res) => {
      if (err) {
        reject(err);
      };
      db.close();
      resolve(res);
    });
  });

  return res.status(200).json({ 'result': found });
});

module.exports = router;
