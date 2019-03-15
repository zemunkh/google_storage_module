var express       = require("express");
var app           = express();
var bodyParser    = require("body-parser");
var multer        = require("multer");
var path          = require("path");
const fs          = require("fs");
var Promise       = require("promise");

var imageUploader = require("./helper/uploader");


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", function(req, res){
  res.render("main");
});

// To move to gscloud upload section
app.post("/upload", function(req, res){
  imageUploader.uploadProfileImage(req, res);
});

app.get("/show", function(req, res){
  res.render("show");
});

app.listen(3000, function(req, res){
  console.log("Auth server started!");
});
