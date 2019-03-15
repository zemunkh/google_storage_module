var multer = require("multer");
var path   = require("path");
var fs     = require("fs");
const sharp = require("sharp");
var Promise = require("promise");

var bucketName = "authdemo-f7863.appspot.com";

var uploaderObj = {};

// Initialize Multer Storage
// Set Multer Upload File handler
const storage = multer.diskStorage({
  destination: "./public",
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() +
    path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {fileSize: 12000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('image');



// gcsObj.compressImage = function(file) {
function compressImage(file) {
  // Return promise
  return new Promise(function(resolve, reject){
    sharp("./public/" + file)
    .rotate()
    .resize(200, 320)
    .toFile("./public/images/" + file, function(err, data){
      if(err){
        reject(err);
      } else {
        resolve(data);  // image has been converted.
      }
    });
  });
}

// Add promise
// Check File Type and Filter it.
// Check file type
// gcsObj.checkFileType = function(file, cb){
function checkFileType(file, cb){
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


// gcsObj.uploadPic = async function (bucketName, filename) {
async function uploadPic(bucketName, filename) {
  // [START storage_upload_file]
  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage({
    projectId: "authdemo-f7863",
    keyFilename: "admin-sdk.json"
  });
  // const storage = new Storage();
  var filedir = "public/images/" + filename;

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

  return new Promise(function(resolve, reject) {
    storage.bucket(bucketName).upload(filedir, options, function(err, file) {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        if(err){
          console.log("Error: Upload is not ok!");
          reject(err);
        } else {
          deleteTempImage(filename);
          resolve(file);
        }
    });
  });

}


uploaderObj.uploadProfileImage = function(req, res){
  upload(req, res, function(err){
      if(err || req.file == undefined){
        res.render("main");
      } else {
        var filename = `${req.file.filename}`;
        console.log("Image Path: " + filename);

        // Start of the image compression function

        var dataPromise = compressImage(filename);
        dataPromise.then(function(result){
              console.log("Promised Result: ", result);
              if(result){

                // Start of image upload session

                var uploadPromise = uploadPic(bucketName, filename);
                uploadPromise.then(function(file){
                  console.log("Upload is resolved");
                  if(file != null){
                    var imageURL = `https://storage.cloud.google.com/${bucketName}/${'profile/' + filename}`;
                    res.render("show", {path: imageURL});
                  } else {
                    console.log("Upload process is not ok! ");
                    res.redirect("/");
                  }

                }, function(err){
                    console.log("Upload process is not successful! ", err);
                    res.redirect("/");
                });
              } else {
                res.redirect("/");
              }
            }, function(err){
              console.log("Conversion is not successful! ", err);
              res.redirect("/");
            });

        // End of image compression
      }
  });
}

// Asyncronous deletion
function deleteTempImage(file) {
  // Multered Image Deletion
  try {
    fs.unlinkSync("./public/" + file);  // After Upload is done, it will delete temp photo.
    console.log("Successfully deleted multered image.");
  } catch (err) {
    console.log("Can't delete multered file!");
  }
  // Converted Image Deletion
  try {
    fs.unlinkSync("./public/images/" + file);  // After Upload is done, it will delete temp photo.
    console.log("Successfully deleted compressed image .");
  } catch (err) {
    console.log("Can't delete compressed file!");
  }
}

module.exports = uploaderObj;
