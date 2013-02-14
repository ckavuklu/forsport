var http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs")
var express = require('express');
sportevents = require('./routes/sportevents.js');

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
app.get('/sportevents/:id', sportevents.findById);
//app.post('/sportevents', sportevents.addSportEvent);
app.post('/sportevents/all', sportevents.populateSportEvents);
app.put('/sportevents/:id', sportevents.updateSportEvent);
app.delete('/sportevents/:id', sportevents.deleteSportEvent);

app.get('/restaurants-api', function(req, res){

    var q = req.query["q"];
    var ll = req.query["ll"];
    var tokens = ll.split(",");
    var lat = 0, lon = 0;

    if (tokens.length == 2) {

        //todo, check if valid numbers & within appropriate bounds

        lat = parseFloat(tokens[0]);
        lon = parseFloat(tokens[1]);
    }
    else {
        //would be better to throw an error, but sending empty response for now
        writeEmptyResponse( res );
        return;
    }

    //http://api.v3.factual.com/t/restaurants-us
    //get source data points from factual
    
    factual.get('/t/restaurants-us',{q:q, sort:"$distance:asc", limit:50, geo:{"$circle":{"$center":[lat,lon],"$meters":FACTUAL_RADIUS_METERS}}, "include_count":"true"}, function (factual_error, factual_res) {
    	
    	     var pointt = sportevents.getAllSportEvents();
    	     var polyg = sportevents.getPolygonArea();
    	     
           var result = {                        
				    points: pointt,              
				    polygons: polyg
            }

            console.log("******************************************", pointt);
            console.log(JSON.stringify(result));
            console.log("******************************************", polyg);
            res.send(JSON.stringify(result));
    });


});

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

    output = output.sort(function(a,b){return a.distance - b.distance});

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


app.listen(3000);
console.log('Listening on port 3000');
