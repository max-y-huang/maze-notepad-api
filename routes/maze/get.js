const express = require('express');
const router = express.Router();

const mdb = require('./../../utils/mongo');
const funcs = require('./../../utils/funcs');

router.get('/', async (req, res, next) => {

  let defaultPage = 1;
  let defaultPageSize = 20;

  let { db, dbo } = await mdb.getDb().catch(err => res.status(500).json({ 'result': err }));

  let query = {};
  if (req.query.tags) {
    // Searching for keywords.
    // Rule: all of the keywords must be at least partially contained in the tags.
    query.$and = funcs.formatToTagNames(req.query.tags).map(tag => {  // All elements in query.$and must be true to satisfy the condition.
      return { '__tag-names': new RegExp(`.*${tag}.*`, 'i') };  // Regex searches if string contains tag.
    });
  };
  let page = req.query.page ? parseInt(req.query.page) : defaultPage;
  let pageSize = req.query['page-size'] ? parseInt(req.query['page-size']) : defaultPageSize;

  let count = await dbo.collection('mazes').find(query, {}).count();
  let items = await new Promise((resolve, reject) => {
    dbo.collection('mazes').find(query, { projection: { '__tag-names': 0 } }).skip((page - 1) * pageSize).limit(pageSize).toArray((err, res) => {
      if (err) {
        reject(err);
      };
      db.close();
      resolve(res);
    });
  });

  return res.status(200).json({ 'result': { 'total-count': count, 'items': items } });
});

module.exports = router;
