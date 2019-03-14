var express = require("express");
var app     = express();
var bodyParser = require("body-parser");
var multer  = require("multer");
var path    = require("path");
const fs    = require("fs");
var Promise = require("promise");

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
  limits: {fileSize: 12000000},
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

// To move to gscloud upload section1
// app.post("/upload", function(req, res){
//   upload(req, res, function(err){
//       if(err || req.file == undefined){
//         res.render("main");
//       } else {
//         var filename = `${req.file.filename}`;
//         console.log("Image Path: " + filename);
//         imageURL = gcs.uploadPic(bucketName, filename);
//         if(imageURL){
//           console.log("URL: ", imageURL);
//           res.render("main", {
//             msg: "File Uploaded",
//             file: `${req.file.filename}`,
//             imageURL: imageURL
//           });
//         } else {
//           res.send("Something wrong when uploading.")
//         }
//       }
//   });
// });

var errHandler = function(err) {
    console.log(err);
}

app.post("/upload", function(req, res){
  // var url = gcs.compressImage();
  // console.log("file:", req.file);
  // var filedir = `${req.file}`;
  // gcs.compressImage(filedir);
  // res.render("show", {path: filedir});

// Add Promise to the project
// Add callback to load compressed Image after completion
  upload(req, res, function(err){
      if(err || req.file == undefined){
        console.log("File size error");
        res.render("main");
      } else {
        var filename = `${req.file.filename}`;
        console.log("Image Path: " + filename);
        // var compImage = gcs.compressImage(filename);
        // res.render("show", {path: compImage});
        var dataPromise = gcs.compressImage(filename);
        dataPromise.then(function(result){
              console.log("Promised Result: ", result);
              if(result){
                var imagePath = "/images/" + filename;
                if(fs.existsSync(imagePath)) {
                  console.log("Image is available!");
                }
                res.render("show", {path: imagePath});
              } else {
                res.redirect("/");
              }

            }, function(err){
              console.log("Conversion is not successful! ", err);
              res.redirect("/");
            });
      }
  });
});



app.get("/show", function(req, res){
  res.render("show");
});

app.listen(3000, function(req, res){
  console.log("Auth server started!");
});
