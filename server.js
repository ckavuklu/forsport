var http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs")
var express = require('express');
sportevents = require('./routes/sportevents.js');

// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 3000;

var app = express();
var request = require('request');

//factual nodejs api here: http://blog.factual.com/factual-node-js-driver
var Factual = require('factual-api');
var factual = new Factual('qUV7WKqUmCsYqVMXG9urVebo9MNLgt0cBE2fT1s8', 'tKG3MHLf1QnpYNS6Mxhtosv4DeoT9rdR0yGeHHrz');

var FACTUAL_RADIUS_METERS = 2000;
var MAX_WALK_TIME_SECONDS = 1200;
var MAX_NON_WALKING_DISTANCE = 4000;

//travel time details here: http://www.traveltimeapp.com/
var TT_DATA_URL = "http://api.igeolise.com/time_filter";
var TT_MAPS_URL = "http://api.igeolise.com/time_map";
var TT_APP_ID = "642843bd";
var TT_APP_KEY = "6d2dcf13a8a8a8f6a1fddbc452515ece";

app.use(function(req, res, next) {
    var oneof = false;
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        oneof = true;
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});


app.get("/", function(req, res) {
    res.redirect("index.html");
});



app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({
        dumpExceptions: true, 
        showStack: true
    }));
    app.use(app.router);
});

app.get('/sportevents', sportevents.findAllSportEvents);
app.get('/sportevents/tweets', sportevents.retrieveTweets);
app.get('/populatedb', sportevents.populatedb);
//app.get('/sportevents/:id', sportevents.findById);
//app.post('/sportevents', sportevents.addSportEvent);
app.post('/sportevents/all', sportevents.populateSportEvents);
app.put('/sportevents/:id', sportevents.updateSportEvent);
app.delete('/sportevents/:id', sportevents.deleteSportEvent);



function writeEmptyResponse( res ) {
    var result = {
        points: [],
        polygons: []
    }
    res.send(JSON.stringify(result));
}

function writeNonWalkingResponse(data, map, res) {

    var output = [];

    for (var x=0; x<data.length; x++) {
        var item = data[x];

        if ( item && item["$distance"] < MAX_NON_WALKING_DISTANCE ){
            item[ "travel_time_seconds"] = -1;
            item[ "travel_time_formatted"] = formatTime( item );
            item[ "distance"] = formatDistance( item["$distance"] );
            output.push(item);
        }
    }

    output = output.sort(function(a,b){
        return a.distance - b.distance
        });

    var result = {
        points: output,
        polygons: []
    }
    res.send(JSON.stringify(result));
}

function formatTime( timeInSeconds ) {

    var mins = Math.floor( timeInSeconds/60 )+1;
    return mins + " mins";//, " + seconds + " sec";
}

function formatDistance( meters ) {

    var miles = meters * 0.000621371;
    return miles.toFixed(2);
}


app.listen(theport);
console.log('Listening on port ',theport);
