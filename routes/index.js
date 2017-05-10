//need to strip the database out and add as its own thing, do after transfer this
var express = require('express');
var router = express.Router();
var path = process.cwd();
var peepdb = require('../model/peepBlog.js');
//const mongoose = require('mongoose');
//var tiles = require('../serverSideJs/slidingServer');
var media = require('../serverSideJs/media');

/*get the home page */
router.get('/',function(req,res){
  //res.sendFile(path + "/public/views/blog.html");
  res.sendFile(path + "/public/views/index.html");
});

router.get('/shiplogs',function(req,res){
  console.log("we are in /shiplogs");
  media.displayLog(function(err,docs){
    res.send(docs);
  });
});
router.get('/popposts',function(req,res){
  console.log("we are in the popposts");
  media.dispPopPost(function(err,docs){
    res.send(docs);
  });
});

//update popular posts likes or comments
router.post('/popposts/',function(req,res){
  console.log("in adding likes");
  media.addLikes(req,function(err,docs){
    res.send(docs);
  });
});

router.post('/popposts/comment/',function(req,res){
  console.log("in adding comments");
  media.addComments(req,function(err,docs){
    res.send(docs);
  });
});

router.get('/newdata',function(req,res){
  var newBlog = peepBlog({
    title: "entered from program",
    by:"Buffy",
    entry:"buffy entry",
    likes: 2
  });
  newBlog.save(function(err) {
    if (err) throw err;

    console.log("Blog created");
  });
});

router.get('/sliding/',function(req,res){
  console.log("we made the request",req.query.board);
  var outstr = tiles.peep_play(req.query.board);
  console.log("we are back",outstr);
  res.send(outstr);
});
module.exports = router;
