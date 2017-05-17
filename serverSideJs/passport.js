var localStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var users = require('../model/peepBlog.js');
var configAuth = require('../config/auth.js');
var mongoose = require('mongoose');

module.exports = function(passport){
  //session setup
  passport.serializeUser(function(user,done){
    console.log("in serializeUser");
    console.log("user.id",user.id);
    done(null,user.id);
  });

  passport.deserializeUser(function(id,done){
    console.log(" in deserializeuser");
    console.log("id is ",id);
    collec = "users";
    mongoose.connection.db.collection(collec,function(err,collection){
    console.log ("collection not found err ",err)
    //collection.findById(id,function(err,user){ sayw findById not a function error
    collection.findOne({'id':id},function(err,user){
      done(err,user);
    });
  });
  });

  //local login
  passport.use('local-login',new localStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true // passentire request
  },
  function(req,email,password,done){// email and password from form }
  console.log("########in the login");
  var collec = "users";
  mongoose.connection.db.collection(collec,function(err,collection){
    console.log("err from collection ",err);
    collection.findOne({'local.email':email},function(err,user){
      console.log("####### err user from findOne ",err,user)
      if (err)
        return done(err);
      if (!user)
        return done(null,false,req.flash('loginMessage','No user found.'));
      console.log("user.local.password ",user.local.password,password);
      console.log("user.local.email : ",user.local.email);
      var newUser = new users.user();
      newUser.email = user.local.email;
      newUser.id = user._id;
      console.log("point 1",newUser._id,user._id);
      newUser.password = user.local.password;
      console.log("point 2 password is ",password);
      console.log(newUser.generateHash(password));
      if (!newUser.validPassword(password,user.local.password)){
        console.log("ths passwords is incorrect");
        return done(null,false,req.flash('loginMessage','Incorrect password'))};
      return done(null,newUser);
    });
  });
}));

  //local singup
  passport.use('local-signup',new localStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true,//pass back entire request
  },
  function(req,email,password,done){
    //asynchronous
    process.nextTick(function(){
      console.log("we are in this findone");
      collec = "users";
      mongoose.connection.db.collection(collec,function(err,collection){
      console.log ("collection not found err ",err)
      collection.findOne({'local.email':email},function(err,user){
        if (err)
          return done(err)
        if (user) {
          console.log("we made it to this error and the done worked");
          return done(null,false,req.flash('signupMessage','This email is already has user'))
        } else {
          console.log("creating new user");
          var newUser = new users.user();
          newUser.password = password;
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(function(err){
            console.log("%%%%%% err ",err);
            if (err){
              console.log("in err ");

              throw err;
            }
            console.log("there wasn't an error here ");
            //return done(null,false,req.flash('signupMessage','totally confused'));
            console.log("id ",newUser._id);
            console.log(newUser);
            return done(null,newUser);

          });
        }
      });
    });
    });
  }
));

//facebook signin
passport.use(new FacebookStrategy({
  clientID: configAuth.facebookAuth.clientID,
  clientSecret: configAuth.facebookAuth.clientSecret,
  callbackURL : configAuth.facebookAuth.callbackURL,
  profileFields: ['id','email','first_name','last_name'],
  },
  function(token,refreshToken,profile,done){
    console.log("we are in the facebook authentication ha ha");
    process.nextTick(function(){
      console.log("id ",profile.id);
      console.log("email ",profile.email);
      console.log("firstname ",profile.name.givenName);
      collec = "users";
      mongoose.connection.db.collection(collec,function(err,collection){
      console.log ("collection not found err ",err)
      collection.findOne({'facebook.id':profile.id},function(err,user){
        if (err)
          return done(err);
        if (user) {
          console.log("user in the database already");
          return done(null,user);
        } else {
          var newUser = new users.user();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + " "+profile.name.familyName;
          newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

          newUser.save(function(err){
            if (err)
              throw err;
            console.log("newuser._id",newUser._id);
            return done(null,newUser);
          });
        }
      });
    });
    });
  }));

  //twitter signin
  passport.use(new TwitterStrategy({
    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callbackURL : configAuth.twitterAuth.callbackURL,
    },
    function(token,refreshToken,profile,done){
      console.log("we are in the twitter authentication tweet tweet");
      process.nextTick(function(){
        collec = "users";
        mongoose.connection.db.collection(collec,function(err,collection){
        console.log ("collection not found err ",err)
        collection.findOne({'twitter.id':profile.id},function(err,user){
          if (err)
            return done(err);
          if (user) {
            console.log("user in the database already");
            return done(null,user);
          } else {
            var newUser = new users.user();
            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            newUser.save(function(err){
              if (err)
                throw err;
              console.log("newuser.username ",newUser.twitter.username);
              return done(null,newUser);
            });
          }
        });
      });
      });
    }));

//google signin

passport.use(new GoogleStrategy({
  clientID: configAuth.googleAuth.clientID,
  clientSecret: configAuth.googleAuth.clientSecret,
  callbackURL : configAuth.googleAuth.callbackURL,
  },
  function(token,refreshToken,profile,done){
    console.log("we are in the google authentication ha ha");
    process.nextTick(function(){
      collec = "users";
      mongoose.connection.db.collection(collec,function(err,collection){
      console.log ("collection not found err ",err)
      collection.findOne({'google.id':google.id},function(err,user){
        if (err)
          return done(err);
        if (user) {
          console.log("user in the database already");
          return done(null,user);
        } else {
          var newUser = new users.user();
          newUser.google.id = profile.id;
          newUser.google.token = token;
          newUser.google.name = profile.displayName;
          newUser.google.email = profile.emails[0].value;

          newUser.save(function(err){
            if (err)
              throw err;
            console.log("newuser.username ",newUser.twitter.username);
            return done(null,newUser);
          });
        }
      });
    });
    });
  }));
}
