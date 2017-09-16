var express = require('express');
var mongoose = require('mongoose');
var app = new express();
var pug = require('pug');
var port = 8000;

app.use(express.static('public'));
app.set("view engine", "pug");
app.set("views", "public/views");

app.listen(port, function() {
	console.log('Server started on port ', port);
});

app.get('/', function(req, res, err) {
	console.log(request);
})

app.get('/emergency', function(req, res, err) {
	res.sendFile('public/emergency.html', { root: __dirname })
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