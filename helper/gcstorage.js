var multer = require("multer");
var path   = require("path");
var fs     = require("fs");

var gcsObj = {};

// Check File Type and Filter it.
// Check file type
gcsObj.checkFileType = function(file, cb){
  // allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  //check extenstion
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}


gcsObj.uploadPic = async function (bucketName, filename) {
  // [START storage_upload_file]
  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage({
    projectId: "authdemo-f7863",
    keyFilename: "admin-sdk.json"
  });
  // const storage = new Storage();
  var filedir = "public/" + filename;

  var options = {
  destination: 'profile/' + filename,
  resumable: true,
  validation: 'crc32c',
  metadata: {
    metadata: {
      event: 'Fall trip to the zoo'
      }
    }
  };

  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filedir, options, function(err, file) {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
    if(err){
      console.log("Error: Upload is not ok!");
      return null;
    } else {
      try {
        fs.unlinkSync(filedir);  // After Upload is done, it will delete temp photo.
        console.log("Successfully deleted temp file.");
      } catch (err) {
        console.log("Can't delete temp file!");
      }
      return `https://storage.cloud.google.com/${bucketName}/${options.destination}`
    }
  });
}

module.exports = gcsObj;
