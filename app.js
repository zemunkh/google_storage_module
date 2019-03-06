var express = require("express");
var app     = express();
var Promise = require('bluebird');
var bodyParser = require("body-parser");
var multer  = require("multer");
var path    = require("path");
const fs    = require("fs");

var gcs = require("./helper/gcstorage");
var bucketName = "authdemo-f7863.appspot.com";

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
  limits: {fileSize: 1000000},
  fileFilter: function(req, file, cb){
    gcs.checkFileType(file, cb);
  }
}).single('image');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", function(req, res){
  res.render("main");
});

app.post("/upload", function(req, res){
  upload(req, res, function(err){
      if(err || req.file == undefined){
        res.render("main");
      } else {
        var filename = `${req.file.filename}`;
        console.log("Image Path: " + filename);
        imageURL = gcs.uploadPic(bucketName, filename);
        if(imageURL){
          console.log("URL: ", imageURL);
          res.render("main", {
            msg: "File Uploaded",
            file: `${req.file.filename}`,
            imageURL: imageURL
          });
        } else {
          res.send("Something wrong when uploading.")
        }
      }
  });
});

app.get("/show", function(req, res){
  res.render("show");
});

app.listen(3000, function(req, res){
  console.log("Auth server started!");
});
