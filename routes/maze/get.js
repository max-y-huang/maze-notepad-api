const express = require('express');
const router = express.Router();

const mdb = require('./../../utils/mongo');
const funcs = require('./../../utils/funcs');

// Returns mazes (offset and limited like pages) that fulfill the input filter. Also returns the total count (that fulfills the filter).
router.get('/', async (req, res, next) => {

  let defaultPage = 1;
  let defaultPageSize = 20;

  // Setup the search query with the filter information.
  let query = {};
  if (req.query.tags) {
    // Searching for keywords.
    // Rule: all of the keywords must be at least partially contained in the tags.
    query.$and = funcs.formatToTagNames(req.query.tags).map(tag => {  // All elements in query.$and must be true to satisfy the condition.
      return { '__tag-names': new RegExp(`.*${tag}.*`, 'i') };  // Regex searches if string contains tag.
    });
  };
  // Setup the page and page size.
  let page = req.query.page ? parseInt(req.query.page) : defaultPage;
  let pageSize = req.query['page-size'] ? parseInt(req.query['page-size']) : defaultPageSize;

  // Get database.
  mdb.getDb((db, dbo) => {
    // Get the total count.
    dbo.collection('mazes').find(query, {}).count().then((count) => {
      // Return the found items (if no fail).
      let skipCount = (page - 1) * pageSize;
      dbo.collection('mazes').find(query, { projection: { '__tag-names': 0 } }).skip(skipCount).limit(pageSize).toArray((err, items) => {
        // Failed to get items.
        if (err) {
          return res.status(500).json({ 'result': err });
        };
        // Success.
        db.close();
        return res.status(200).json({ 'result': { 'total-count': count, 'items': items } });
      });
    });
  }, (err) => {
    // Failed to get database.
    return res.status(500).json({ 'result': err });
  });
});

module.exports = router;
