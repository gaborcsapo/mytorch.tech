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
/////////////////////////////////////////////////////////////
//Configuration
/////////////////////////////////////////////////////////////
// configure Express
app.use(express.static('public'));
app.set("view engine", "pug");
app.set("views", "public/views");
//app.use(favicon('public','favicon.ico'));

app.use( cookieParser()); 
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));

app.listen(port, function() {
  console.log('Server started on port ', port);
});

//Set up default mongoose connection
 var mongoDB = 'mongodb://heroku_zrbvl1q1:rd9fsak8ac7np3ud23hagmu5fg@ds153113.mlab.com:53113/heroku_zrbvl1q1'
    // process.env.MONGOLAB_URI ||
    // process.env.MONGODB_URI ||
    // process.env.MONGOHQ_URL ||
    // 'mongodb://127.0.0.1/my_database';

mongoose.connect(mongoDB, {useMongoClient: true}, function(){
    if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
    console.log ('Succeeded connected to: ' + uristring);
    }
    /* Drop the DB */
    //mongoose.connection.db.dropDatabase();
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/////////////////////////////////////////////////////////////
//Twillio setup
/////////////////////////////////////////////////////////////
var accountSid = 'AC0b4dd92564225048f717aaa016bab864'; 
var authToken = '36dd70b5af39ea604ed0e883a7a2df9d'; 
var client = require('twilio')(accountSid, authToken);
var recipient = '+971563052997';

/////////////////////////////////////////////////////////////
// Google Login API stuff
/////////////////////////////////////////////////////////////
var GOOGLE_CLIENT_ID      = "940480382034-7tdll4daeqk1n5nja83e3cp4untm9dtf.apps.googleusercontent.com"
  , GOOGLE_CLIENT_SECRET  = "DANHTfljRXhm8zkPdiTGkO5Y";

// Passport session setup.
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

//saving session
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

app.get('/', ensureAuthenticated, function(req, res){
  res.render('login.pug');
});

//click on login
app.get('/login', function(req, res){
  res.render('login.pug');
});

//login redirect to the Google login page
app.get('/auth/google', passport.authenticate('google', { successRedirect: '/',scope:
  ['email']
}));

// the redirect after successful login
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
var usermodel = mongoose.model('udermodel', userschema );

function add_or_update(req){
  usermodel.findOne({myemail: req.session.passport.user.email}, function(err, found_user){
    if (err) {
        console.log("The error while updating colleciton is " + err);
    }
    if (found_user){
        console.log('User already exists, info updated')
        found_user.myemail = req.session.passport.user.email
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

function print_db(){
  // PRINTS ALL EMTRIES
  usermodel.find(function (err, kittens) {
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


app.get('/emergency', ensureAuthenticated, function(req, res, err) {
  res.render('emergency.pug', {'myLocation': req.query.myLocation});
  
  // client.messages.create({ 
  //     to: recipient, 
  //     from: "+16093725592", 
  //     body: req.query.myLocation + " is the location.", 
  // }, function(err, message) { 
  //   if (err){
  //     console.log(err)
  //   }
  //     console.log('SMS sent', message.sid); 
  // });
  
});

app.get('/danger', ensureAuthenticated, function(req, res, err) {
  res.render('danger.pug', {'myLocation': req.query.myLocation});
  
  // client.messages.create({ 
  //     to: recipient, 
  //     from: "+16093725592", 
  //     body: req.query.location + " is the location.", 
  // }, function(err, message) { 
  //   if (err){
  //     console.log(err)
  //   }
  //     console.log('SMS sent', message.sid); 
  // });
  
});

app.get('/tutorial', ensureAuthenticated, function(req, res, err) {
  console.log(req)
  res.render('tutorial.pug')
});

app.get('/settings', ensureAuthenticated, function(req, res, err) {
  res.render('settings.pug')
});

app.post('/settings/saved', ensureAuthenticated, function(req, res, err) {
  add_or_update(req)
  print_db()
  res.redirect('/home')
});

app.post('/emergency/submit', ensureAuthenticated, function(req, res, err) {
  console.log(req.body);
  res.render('emergency-submit.pug');
});

app.post('/danger/submit', ensureAuthenticated, function(req, res, err) {
  console.log(req.body);
  res.render('danger-submit.pug');
});

app.get('/tips', ensureAuthenticated, function(req, res, err) {
  res.render('tips.pug')
});