/*
This file is the backbone of mytorch app
Main setup using Express.js
*/

var express          = require( 'express' )
  , app              = express()
  , server           = require( 'http' ).createServer( app ) 
  , passport         = require( 'passport' )
  , util             = require( 'util' )
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , GoogleStrategy   = require( 'passport-google-oauth2' ).Strategy
  , pug              = require( 'pug')
  , mongoose         = require('mongoose')
  //, favicon          = require( 'serve-favicon')
  , port             = process.env.PORT || 8002;

https = require('https');

///////////////////////////////////////////////////////////////////////
//Express.js Configuration
///////////////////////////////////////////////////////////////////////
/*
all public files lives in the public directory
all html/front end pages are rendered using pug.js and live in the public/views folder
*/
app.use(express.static('public'));
app.set("view engine", "pug");
app.set("views", "public/views");
//app.use(favicon('public','favicon.ico'));

/*
Extra set up for bodyParser. Necessary for parsing request and response queries
*/
app.use( cookieParser()); 
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));

app.listen(port, function() {
  console.log('Server started on port ', port);
});

/*
Set up default mongoose connection
You can view the results of the database on heroku dashboard when deployed
Local database resets everytime though
*/
 var mongoDB = 
    process.env.MONGOLAB_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/my_database';

mongoose.connect(mongoDB, {useMongoClient: true}, function(err){
    if (err) {
      console.log ('ERROR connecting' + err);
    } else {
      console.log ('Succeeded connected');
    }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

///////////////////////////////////////////////////////////////////////
//Twillio Text Messaging API
///////////////////////////////////////////////////////////////////////

/*
the receipient number variable is currently hardcoded to go to Gabor Csapo's phone number
*/
var accountSid = 'AC0b4dd92564225048f717aaa016bab864'; 
var authToken = '36dd70b5af39ea604ed0e883a7a2df9d'; 
var client = require('twilio')(accountSid, authToken);

/*
below recipient variable should be deleted and the corresponding phone number 
for each help request should be passed as a parameter to the send_text() function.
*/
var recipient = '+971563052997';

/*
This is the main send_text() method to send messages to appropriate bodies.
Right now it's receiving the query body from the GET request from home.pug
The locationStr is the string to indicate the address string
If the student has a phone number, it is sent in the SMS to allow direct contact
*/

function send_text(reqBody, recipient, user){
  var locationStr = reqBody.building + reqBody.buildingRes + " " + reqBody.room
  var messageBody = "EMERGENCY. Urgent help requested at " + locationStr + " for "+reqBody.situation+". Please go to the location now."
  
  usermodel.findOne({myemail: user}, function(err, found_user){
    if (err) {
        console.log("The error while accessing the colleciton is " + err);
    }
    if (found_user){
        messageBody = messageBody + ' Contact student at: ' + found_user.myphone
    }
  })

  client.messages.create({ 
      to: recipient, 
      from: "+16093725592", 
      body: messageBody, 
  }, function(err, messageres) { 
    if (err){
      console.log(err)
    }
      console.log('SMS sent', messageres.sid); 
  });
}

///////////////////////////////////////////////////////////////////////
//Google Passport Authentication Set-up
///////////////////////////////////////////////////////////////////////
var GOOGLE_CLIENT_ID      = "940480382034-7tdll4daeqk1n5nja83e3cp4untm9dtf.apps.googleusercontent.com"
  , GOOGLE_CLIENT_SECRET  = "DANHTfljRXhm8zkPdiTGkO5Y";

// Passport session setup
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

/*
saving session
*/
app.use(cookieParser());
app.enable('trust proxy'); // add this line
app.use( session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  proxy: true, // add this line
  cookie: {
    secure: false, //set to false because we are not on https
    maxAge: 3600000
  }
}));

app.use( passport.initialize());
app.use( passport.session());

/*
Accessing the main URL will first check if the user is authenticated and render the login page
*/
app.get('/', ensureAuthenticated, function(req, res){
  res.render('login.pug');
});

/*
going directly to the login page
*/
app.get('/login', function(req, res){
  res.render('login.pug');
});

/*
login redirect to the Google login page
*/
app.get('/auth/google', passport.authenticate('google', { successRedirect: '/',scope:
  ['email']
}));

/*
the redirect after successful login
*/
app.get('/auth/google/callback',function(req, res, next) {
  passport.authenticate('google', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      req.session.save(() => {
        setTimeout(function(){
          lookup_db(user.email, res)
        }, 1000)        
        return;
      })      
    });
  })(req, res, next);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  console.log('unauth')
  res.redirect('/login');
}

///////////////////////////////////////////////////////////////////////
//Database interaction
///////////////////////////////////////////////////////////////////////
var DB = {}

function lookup_db(email, res){
  //check if nyu email
  if ((!email.endsWith("@nyu.edu"))){
    console.log('not nyu', email); 
    return res.redirect('/login'); 
  }
  //check if first visit
  usermodel.findOne({myemail: email}, function(err, found_user){
    if (err) {
        console.log("The error while accessing the colleciton is " + err);
    }
    if (found_user){
        res.redirect('/home');
        console.log('new session with returning user: ', found_user);
    } else {
      res.redirect('/tutorial');
    }
  })
}  

/*
Database schema for storing the user's friends contact numbers and netIDs
*/
var Schema = mongoose.Schema;
var userschema = new Schema({
    myemail: String,
    myphone: String,
    name1: String,
    name2: String,
    name3: String,
    phone1: String,
    phone2: String,
    phone3: String,
    netid1: String,
    netid2: String,
    netid3: String,
});
var usermodel = mongoose.model('usermodel', userschema );

function add_or_update(req){
  usermodel.findOne({myemail: req.session.passport.user.email}, function(err, found_user){
    if (err) {
        console.log("The error while updating colleciton is " + err);
    }
    if (found_user){
        console.log('User already exists, info updated')
        found_user.myphone = req.body.myphone
        found_user.name1 = req.body.name2
        found_user.name2 = req.body.name3
        found_user.name3 = req.body.name3
        found_user.phone1 = req.body.phone1
        found_user.phone2 = req.body.phone2
        found_user.phone3 = req.body.phone3
        found_user.netid1 = req.body.netid1
        found_user.netid2 = req.body.netid2
        found_user.netid3 = req.body.netid3
        found_user.save(function(err) {
            if (err)
                throw err
            return (null, found_user)
        });
    }
    if (!found_user) {
      console.log('Saving new user', req.body, req.session.passport.user.email)
      var newuser = new usermodel({
        myemail: req.session.passport.user.email,
        myphone: req.body.myphone,
        name1: req.body.name2,
        name2: req.body.name3,
        name3: req.body.name3,
        phone1: req.body.phone1,
        phone2: req.body.phone2,
        phone3: req.body.phone3,
        netid1: req.body.netid1,
        netid2: req.body.netid2,
        netid3: req.body.netid3,
      });
      newuser.save(function (err, fluffy) {
        if (err) return console.error(err);
      });
    }
  })
}

var recordschema = new Schema({
    email: String,
    situ: String,
    who: String,
    what: String,
    when: String
});

var recordmodel = mongoose.model('recordmodel', recordschema );

function add_record(req, sit){
  //add the record to our database
  console.log(req)
  var dt = new Date();
  var newrecord = new recordmodel({
    email: req.session.passport.user.email,
    situ: sit,
    who: req.body.who,
    what: req.body.what,
    when: dt.toUTCString()
  });
  newrecord.save(function (err, fluffy) {
    if (err) return console.error(err);
  });
}


function print_db(){
  // PRINTS ALL Entries
  usermodel.find(function (err, kittens) {
    if (err) return console.error(err);
    console.log(kittens);
  })
  recordmodel.find(function (err, kittens) {
    if (err) return console.error(err);
    console.log(kittens);
  })
}

///////////////////////////////////////////////////////////////////////
//Routes, MAKE SURE TO AUTHENTICATE
///////////////////////////////////////////////////////////////////////

app.get('/home', ensureAuthenticated, function(req, res, err) {
  res.render('home.pug');
});


/*
Tutorial page is what the user sees when they register for the first time
This page prompts users to input their and their friends' contact info
*/
app.get('/tutorial', ensureAuthenticated, function(req, res, err) {
  console.log(req)
  res.render('tutorial.pug')
});

/*
Contacts page is where the user can edit their or their friends' contact info
*/
app.get('/contacts', ensureAuthenticated, function(req, res, err) {
  res.render('contacts.pug')
});

/*
When the user clicks on save contacts, the database will be added or updated
The user will then be redirected to the main home page
*/
app.post('/contacts/saved', ensureAuthenticated, function(req, res, err) {
  add_or_update(req)
  print_db()
  res.redirect('/home')
});

/*
This page is when you press for help from Public Safety
It renders the emergency.pug view and pass on the parameters such as the location and situation
It then sends text to the public safety number, which will be set within the router below
*/
app.get('/emergency', ensureAuthenticated, function(req, res, err) {
  res.render('emergency.pug', {'building': req.query.building, 'room': req.query.room, 
    'situation': req.query.situation, 'buildingRes': req.query.buildingRes, 'helpFrom' : 'Public Safety'});
  console.log(req.query)
  //UNCOMMENT THIS AND INPUT PUBLIC SAFETY's NUMBER
  //var recipient = PUBLIC SAFETY'S NUMBER
  send_text(req.query, recipient, req.session.passport.user.email)
});

/*
This page is when you press for help from RA's on duty
It renders the emergency.pug view and pass on the parameters such as the location and situation
It then sends text to the RA's number, which will be set within the router below
*/
app.get('/danger', ensureAuthenticated, function(req, res, err) {
  res.render('emergency.pug', {'building': req.query.building, 'room': req.query.room, 
    'situation': req.query.situation, 'buildingRes': req.query.buildingRes, 'helpFrom' : 'RAs on duty'});
  //UNCOMMENT THIS AND INPUT RA's NUMBER
  //var recipient = RA'S NUMBER
  send_text(req.query, recipient, req.session.passport.user.email)
});

/*
This page is when you press for help from your friends
It renders the emergency.pug view and pass on the parameters such as the location and situation
It then sends texts to your friends' numbers, which will be retrieved and then set within the router below
*/
app.get('/friends', ensureAuthenticated, function(req, res, err) {
  res.render('emergency.pug', {'building': req.query.building, 'room': req.query.room, 
    'situation': req.query.situation, 'buildingRes': req.query.buildingRes, 'helpFrom' : 'your friends'});
  //Below should be a for loop to iterate through all of your friends' numbers
  //var recipient = RA'S NUMBER
  send_text(req.query, recipient, req.session.passport.user.email)
});

/*
The three routes below are for submitting help requests.
The user's report on the incident will be saved to the database
They then render the emergecy-submit.pug which contains a link to safety tips 
*/
app.post('/emergency/submit', ensureAuthenticated, function(req, res, err) {
  console.log(req.body);
  res.render('emergency-submit.pug');
  add_record(req, 'emergency');
});

app.post('/danger/submit', ensureAuthenticated, function(req, res, err) {
  console.log(req.body);
  res.render('emergency-submit.pug');
  add_record(req, 'danger');
});

app.post('/friends/submit', ensureAuthenticated, function(req, res, err) {
  console.log(req.body);
  res.render('emergency-submit.pug');
  add_record(req, 'sub-danger');
});

/*
This tips page is where first aid response tips live.
Currently the user is shown help texts for three scenarios 
*/
app.get('/tips', ensureAuthenticated, function(req, res, err) {
  res.render('tips.pug')
});