//need to strip the database out and add as its own thing, do after transfer this
var express = require('express');
var router = express.Router();
var path = process.cwd();
var peepdb = require('../model/peepBlog.js');
const mongoose = require('mongoose');
var tiles = require('../serverSideJs/slidingServer')

/*get the home page */
router.get('/',function(req,res){
  //res.sendFile(path + "/public/views/blog.html");
  res.sendFile(path + "/public/views/index.html");
});

router.get('/shiplogs',function(req,res){
  console.log("we are here again");
  const collec = "logs";
  mongoose.connection.db.collection(collec,function(err,collection){
      collection.find({}).toArray(function(err,data){
        console.log("*************data",data);
        res.send(data);
      })
    })
});
router.get('/popposts',function(req,res){
  console.log("we are in the popposts");
  const collec = "posts";
  mongoose.connection.db.collection(collec,function(err,collection){
      collection.find({}).toArray(function(err,data){
        console.log("*************data",data);
        res.send(data);
      })
    })
});

//update popular posts likes or comments
router.post('/popposts/',function(req,res){
  var query;
  var ObjectId = require('mongoose').Types.ObjectId;
  var query = {_id:new ObjectId(req.body.id.toString())};
  const collec="posts";
  var likes = parseInt(req.body.likes);
  if (likes == -1) {//updating like article
    query = {_id:new ObjectId(req.body.id.toString())};
    console.log("in increment");
    inc = {$inc:{likes:1}};
  } else {
    console.log("likes ",likes+1);
    likes +=1;
    query = {_id:new ObjectId(req.body.id.toString()),'comments.nbr':likes};
    inc = {$inc:{'comments.$.like':1}};
  }
  mongoose.connection.db.collection(collec,function(err,collection){
    collection.update(query,inc,function(err,numAffected){
      if (err){console.log("there was an error",err)}
      else {
        res.send("all worked");
      }
    });
  });
});
router.post('/popposts/comment/',function(req,res){
  //need to sanitize the comment before storing, then don't check when take out
  var ObjectId = require('mongoose').Types.ObjectId;
  const collec="posts";
  var author = req.body.author;
  var comment = req.body.comment;
  var nbr = parseInt(req.body.nbr);
  console.log("nbr ",nbr);
  query = {_id:new ObjectId(req.body.id.toString())};
  var push = {'$push':{'comments':{'date':'today','nbr':nbr,'comment':comment,'author':author,'like':0}}};
  mongoose.connection.db.collection(collec,function(err,collection){
    collection.update(query,push,function(err,data){
      if (err) console.log("there was as error",err)
      else {
        //need to add the author and comment and send back in json after sanitize
        res.send(req.body.comment);
      }
    })
  })
})

/*should be a post request*/
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
router.get('/helloworld',function(req,res){
  res.send("this is working hello world");
});
router.get('/again',function(req,res){
  res.send("we did recompile");
});
router.get('/sliding/',function(req,res){
  console.log("we made the request",req.query.board);
  var outstr = tiles.peep_play(req.query.board);
  console.log("we are back",outstr);
  res.send(outstr);
});
module.exports = router;
