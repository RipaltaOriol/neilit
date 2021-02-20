// load requirements
const aws = require('aws-sdk')

// configuration
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ID,
  secretAccessKey: process.env.S3_SECRET
})

module.exports = s3
