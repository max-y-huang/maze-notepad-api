const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const aws = require('./../../utils/aws');
const mdb = require('./../../utils/mongo');
const funcs = require('./../../utils/funcs');
const upload = multer({ dest: './uploads' });

const uploadFields = [
  { name: 'maze-file', maxCount: 1 },
  { name: 'image-file', maxCount: 1 }
];

router.post('/', upload.fields(uploadFields), async (req, res, next) => {

  let missingParams = [];
  if (!req.files) {
    return res.status(500).json({ 'result': 'Missing req.files and/or req.body.' });
  }
  if (!req.files['maze-file'] || !req.files['maze-file'][0]) {
    missingParams.push('maze-file');
  }
  if (!req.files['image-file'] || !req.files['image-file'][0]) {
    missingParams.push('image-file');
  }
  if (!req.body.name) {
    missingParams.push('name');
  }
  if (!req.body.tags) {
    missingParams.push('tags');
  }
  if (missingParams.length !== 0) {
    return res.status(400).json({ 'result': `Missing the following required parameters: ${missingParams.join(', ')}` });
  }

  let input__name = req.body.name;
  let input__mazeFileName = req.files['maze-file'][0].filename;
  let input__imageFileName = req.files['image-file'][0].filename;
  let input__tags = funcs.uniqueArrayByKey([
    ...funcs.formatToTags(req.body.tags),
    ...funcs.formatToTags(req.body.name, true)
  ], 'name');
  let input__tagNames = input__tags.map(x => x.name);

  let { db, dbo } = await mdb.getDb().catch(err => res.status(500).json({ 'result': err }));

  let insertedId = await new Promise((resolve, reject) => {

    dbo.collection('mazes').insertOne({

      'name': input__name,
      'maze-file-name': input__mazeFileName,
      'image-file-name': input__imageFileName,
      'tags': input__tags,
      '__tag-names': input__tagNames
      
    }, (err, res) => {
      if (err) {
        reject(err);
      };
      db.close();

      aws.getS3((s3) => {

        let mazeFile = fs.readFileSync(`uploads/${input__mazeFileName}`);
        let imageFile = fs.readFileSync(`uploads/${input__imageFileName}`);
        
        // TODO: Use proper file extension code.
        // Upload maze and image to AWS S3.
        s3.upload({ Bucket: 'maze-notepad', Key: `mazes/${input__mazeFileName}.mznp`, Body: mazeFile }, (err, data) => {
          if (err) {
            reject(err); 
          }
          s3.upload({ Bucket: 'maze-notepad', Key: `images/${input__imageFileName}.png`, Body: imageFile }, (err, data) => {
            if (err) {
              reject(err); 
            }
            resolve(res.insertedId);
          });
        });
      });
    });
  });

  return res.status(200).json({ 'result': { 'id': insertedId } });
});

module.exports = router;
