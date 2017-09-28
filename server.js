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
  , MongoStore       = require( 'connect-mongo')(session)
  , port             = 8002;

https = require('https');

// configure Express
app.use(express.static('public'));
app.set("view engine", "pug");
app.set("views", "public/views");

app.use( cookieParser()); 
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));

app.listen(port, function() {
  console.log('Server started on port ', port);
});


//Twillio setup
var accountSid = 'AC0b4dd92564225048f717aaa016bab864'; 
var authToken = '36dd70b5af39ea604ed0e883a7a2df9d'; 
var client = require('twilio')(accountSid, authToken);
var recipient = '+971563052997';

/////////////////////////////////////////////////////////////
// Google Login API stuff
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
    callbackURL: "http://localhost:8002/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

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
      //if it's not an nyu.edu email, go back to login
      if ((!user.email.endsWith("@nyu.edu"))) { console.log('not nyu', user.email); return res.redirect('/login'); }
      req.session.save(() => {
        setTimeout(function(){
          res.redirect('/home');

          console.log('saving');  
          console.log(user);
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
//Routes MAKE SURE TO AUTHENTICATE

app.get('/home', ensureAuthenticated, function(req, res, err) {
  res.render('home.pug');
  res.send(req.query.location);
});


app.get('/emergency', ensureAuthenticated, function(req, res, err) {
  res.render('emergency.pug', {'myLocation': req.query.myLocation});
  
  client.messages.create({ 
      to: recipient, 
      from: "+16093725592", 
      body: req.query.location + " is the location.", 
  }, function(err, message) { 
    if (err){
      console.log(err)
    }
      console.log('SMS sent', message.sid); 
  });
  
});

app.get('/danger', ensureAuthenticated, function(req, res, err) {
  res.render('danger.pug', {'myLocation': req.query.myLocation});
  /*
  client.messages.create({ 
      to: recipient, 
      from: "+16093725592", 
      body: req.query.location + " is the location.", 
  }, function(err, message) { 
    if (err){
      console.log(err)
    }
      console.log('SMS sent', message.sid); 
  });
  */
});


app.get('/settings', ensureAuthenticated, function(req, res, err) {
  res.render('settings.pug')
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