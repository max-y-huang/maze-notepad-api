const AWS = require('aws-sdk');

let credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

let s3 = null;

const getS3 = (callback = null) => {
  if (s3) {
    callback(s3);
    return;
  }
  s3 = new AWS.S3(credentials);  // TODO: Implement fail.
  callback(s3);
}

module.exports = { getS3 };
