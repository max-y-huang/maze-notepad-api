const express = require('express');
const router = express.Router();

const mdb = require('./../../utils/mongo');

router.get('/', async (req, res, next) => {

  let { db, dbo } = await mdb.getDb().catch(err => res.status(500).json({ 'result': err }));

  let query = {};
  if (req.query.tags) {
    // Searching for keywords.
    // Rule: all of the keywords must be at least partially contained in the tags.
    query.$and = req.query.tags.split(/[\s,]+/).map(tag => {  // All elements in query.$and must be true to satisfy the condition.
      return { 'tags': new RegExp(`.*${tag}.*`, 'i') };  // Regex searches if string contains tag.
    });
  };

  let found = await new Promise((resolve, reject) => {
    dbo.collection('mazes').find(query).toArray((err, res) => {
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
