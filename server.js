var express = require('express');
var mongoose = require('mongoose');
var app = new express();
var pug = require('pug');
var bp = require('body-parser');

var accountSid = 'AC0b4dd92564225048f717aaa016bab864'; 
var authToken = '36dd70b5af39ea604ed0e883a7a2df9d'; 
var client = require('twilio')(accountSid, authToken);
var recipient = '+971563052997';

var port = 8000;

app.use(express.static('public'));
app.set("view engine", "pug");
app.set("views", "public/views");
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

app.listen(port, function() {
	console.log('Server started on port ', port);
});

app.get('/', function(req, res, err) {
	console.log(request);
})

app.post('/emergency', function(req, res, err) {
	res.sendFile('public/emergency.html', { root: __dirname })
	console.log(req.body.location)
	/*sending SMS*
	client.messages.create({ 
	    to: recipient, 
	    from: "+15017250604", 
	    body: req.body.location, 
	}, function(err, message) { 
	    console.log('SMS sent', message.sid); 
	});
	*/
});

app.get('/danger', function(req, res, err) {
	res.sendFile('public/danger.html', { root: __dirname })
});

/*
mongoose.connect("mongodb://localhost/test");

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

var Report;

db.on('open', function() {
	console.log("Connection to DB successful");

	var reportSchema = mongoose.Schema({
		netid: String,
		type: String,
		bystander: Boolean,
		date: { type: Date, default: Date.now },
		involved: String,
		description: String
	});

	Report = mongoose.model('Report', reportSchema);

	Report.find(function(err, all_reports){
		console.log(all_reports);
	});
});

app.get('/emergency-reported', function(req, res, err){
	console.log(req.query);

	var new_report = new Report({
		netid: req.query.em_netid,
		type: "emergency",
		bystander: req.query.em_bystander,
		involved: req.query.em_involved,
		description: req.query.em_description
	});

	new_report.save(function(err, new_report){
		if(err)
			return console.error(err)
		else
			console.log('saved new report')
	});

	res.send('Successful save');
});
*/