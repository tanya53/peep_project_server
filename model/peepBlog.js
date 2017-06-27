//need to pull the user into its own database, use two mongoose databases
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

// create a Schema for popular post articles and the comments
var popularPostSchema = new Schema({
  title: String,
  by : String,
  entry: Number,
  likes : Number,
  date : String,
  comments : [{commentdate : String,comment:String,author:String,commentlikes:Number}]
});
//schema for tigger's log
var shipLogSchema = new Schema({
  title: String,
  date : String,
  entry : String
});
//schema for polls
var pollSchema = new Schema({
  creator : String,
  title: String,
  items:[{itemnbr: Number, item:String,votes:String}]
});
//schema for user for authentication
var userSchema = new Schema({
  local :{
    email : String,
    password : String,
  },
  facebook : {
    id : String,
    token : String,
    email : String,
    name : String,
    username: String,
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username : String,
  },
  google : {
    id : String,
    token : String,
    email : String,
    name : String
  },
});

//generate the hash of the password, encrypt in database for local user
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8),null);
};

//check if the password is valid or Not for local user
userSchema.methods.validPassword = function(password,pass2){
  return bcrypt.compareSync(password,pass2);

};

var popularPost = mongoose.model('popularPost',popularPostSchema,'posts');
var shipLog = mongoose.model('shipLog',shipLogSchema,'logs');
var user = mongoose.model('user',userSchema,'users');
var poll = mongoose.model('poll',pollSchema,'polls');
module.exports = {popularPost,shipLog,user,poll};
