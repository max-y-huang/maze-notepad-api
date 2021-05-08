const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const aws = require('./../../utils/aws');
const mdb = require('./../../utils/mongo');
const funcs = require('./../../utils/funcs');
const upload = multer({ dest: './uploads' });

// Upload fields for POST request.
const uploadFields = [
  { name: 'maze-file', maxCount: 1 },
  { name: 'image-file', maxCount: 1 }
];

// Uploads a maze to the MongoDB database, uploads required files to the AWS S3 Bucket, returns the MongoDB id of the newly created maze.
router.post('/', upload.fields(uploadFields), async (req, res, next) => {

  // TODO: Use proper file extension code.

  // Validate fields.
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
    return res.status(400).json({ 'result': `Missing parameters: ${missingParams.join(', ')}` });
  }

  let invalidParams = [];
  if (!req.body.name.match(/[^\s,]/)) {  // Must contain non-space/comma characters.
    invalidParams.push('name');
  }
  if (!req.body.tags.match(/[^\s,]/)) {  // Must contain non-space/comma characters.
    invalidParams.push('name');
  }
  if (invalidParams.length !== 0) {
    return res.status(400).json({ 'result': `Invalid parameters: ${invalidParams.join(', ')}` });
  }

  // Convert input from strings/files to workable data.
  let input__name          = req.body.name;
  let input__mazeFileName  = req.files['maze-file'][0].filename;
  let input__imageFileName = req.files['image-file'][0].filename;
  let input__tags          = funcs.mergeTags(funcs.formatToTags(req.body.tags), funcs.formatToTags(req.body.name, { hidden: true }));
  let input__tagNames      = input__tags.map(x => x.name);
  let input__description   = req.body.description ? req.body.description : null;

  // Insert a maze into the mazes collection.
  let objectForInsertion = {
    'name':            input__name,
    'maze-file-name':  input__mazeFileName,
    'image-file-name': input__imageFileName,
    'tags':            input__tags,
    '__tag-names':     input__tagNames,
    'description':     input__description
  };

  // S3 comes before MongoDB because storage residue is acceptable, but database residue is not.

  // Get AWS S3 Bucket.
  aws.getS3((s3) => {  // TODO: Implement fail.
    // Retrieve newly uploaded files (directory set with Multer).
    let mazeFile = fs.readFileSync(`uploads/${input__mazeFileName}`);
    let imageFile = fs.readFileSync(`uploads/${input__imageFileName}`);
    // Upload maze to AWS S3 bucket.
    s3.upload({ Bucket: 'maze-notepad', Key: `mazes/${input__mazeFileName}`, Body: mazeFile }, (err) => {
      // Failed to upload maze.
      if (err) {
        return res.status(500).json({ 'result': err });
      }
      // Upload image to AWS S3 bucket.
      s3.upload({ Bucket: 'maze-notepad', Key: `images/${input__imageFileName}`, Body: imageFile }, (err) => {
        // Failed to upload image.
        if (err) {
          return res.status(500).json({ 'result': err });
        }
        // Get MongoDb.
        mdb.getDb((db, dbo) => {
          dbo.collection('mazes').insertOne(objectForInsertion, (err, insertRes) => {
            // Failed to insert to database,
            if (err) {
              return res.status(500).json({ 'result': err });
            };
            // Success.
            db.close();
            return res.status(200).json({ 'result': { 'id': insertRes.insertedId } });
          });
        }, (err) => {
          // Failed to get database.
          return res.status(500).json({ 'result': err });
        });
      });
    });
  });
});

module.exports = router;
