var mongoose = require('mongoose'), Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://127.0.0.1:27017/test');

/*Object Model*/
var sportSchema = Schema({
    sportId: String
    ,name: String
});

var sportTypeSchema = Schema({
    sportTypeId: String
    , name: String
});

var placeTypeSchema = Schema({
    placeTypeId: String
    , name: String
});

var placeSchema = new Schema({
    placeId: String
  , tffPlaceId: String
  , name: String
  , typeId : { type: Schema.ObjectId, ref: 'PlaceType' }
  , address: String
  , city: String
  , country: String
  , loc : {type: [Number], index: '2d'}
  , photos: [String]
  , capacity: String
});

var teamSchema = new Schema({
    teamId: String
  , tffTeamId: String
  , tffClubId: String
  //, placeId: String
  , name    : String
  , placeId : { type: Schema.ObjectId, ref: 'Place' }
  , sportTypeId : { type: Schema.ObjectId, ref: 'SportType' }
  , logo   : [String]
  , city    : String
  , country : String
  , website : String
  , region : String
});

var organizationSchema = new Schema({
   gsId: String
  , name : String
  , start_date: Date
  , end_date: Date
  , sportsId     : { type: Schema.ObjectId, ref: 'SportType' }
});

var eventSchema = new Schema({
    week: String
  , matchId : String
  , hometeamId: { type: Schema.ObjectId, ref: 'Team' }
  , awayteamId: { type: Schema.ObjectId, ref: 'Team' }
  , eventDate: Date
  , eventTime: String
  , placeId     : { type: Schema.ObjectId, ref: 'Place' }
});
 
var Sport = mongoose.model('Sport', sportSchema);
var SportType = mongoose.model('SportType', sportTypeSchema);
var Organization = mongoose.model('Organization', organizationSchema);
var Place = mongoose.model('Place', placeSchema);
var PlaceType = mongoose.model('PlaceType', placeTypeSchema);
var Team = mongoose.model('Team', teamSchema);
var Event = mongoose.model('Event', eventSchema);





exports.findById = function(req, res) {
	var id = req.params.id;
	console.log('Retrieving event: ' + id);
	db.collection('sportevents', function(err, collection) {
	collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
		res.send(item);
	});
});
};

var nearPlacesAndEvents = function (obj) {
  console.log(obj);
}


var placeInsert = function(arg, callback) {
	var obj = JSON.stringify(arg);
	var obje = JSON.parse(obj);
	
	async.waterfall([
			function(callb) {
			    callb(null, obje);
			},

			function(arg1, callb) {
			  callback(null,'Place Inserted!');
			}
		],
		function (err, caption) {
      			callback();
  		}
	);
}


exports.findAllSportEvents = function(req, res) {
	var q = req.query["q"];
	var ll = req.query["ll"];
	var dist = parseFloat(req.query["dist"]);
	var tokens = ll.split(",");
	var lat = 0, lon = 0;

	if (tokens.length == 2) {
		//todo, check if valid numbers & within appropriate bounds
		console.log("todo, check if valid numbers & within appropriate bounds");
		lat = parseFloat(tokens[0]);
		lon = parseFloat(tokens[1]);
	}
	else {
		//would be better to throw an error, but sending empty response for now
		console.log("would be better to throw an error, but sending empty response for now");
		return;
	}

	var nowDate = new Date();
	var nextDate = new Date();
	var returnObject = new Array();
	nextDate.setDate(nowDate.getDate()+7);
	
	console.log(nowDate);
	console.log(nextDate);

        Event.find({eventDate : { $gt: nowDate, $lt: nextDate }}).populate('placeId', null, {loc: {$maxDistance: dist/111.2, $near: [lat,lon]} }).exec(function(err, pl) { 
	  res.send({events: pl});
	});
	

	/*db.collection('sportevents', function(err, collection) {
		collection.find().toArray(function(err, items) {
			var output = { points : items,
				polygons:[[[32.658844,-117.095734],[32.664352,-117.110397],[32.665211,-117.110733],[32.668373,-117.109688],[32.672939,-117.106956],[32.682457,-117.100403],[32.680431,-117.090553],[32.675617,-117.080437],[32.6740959,-117.0789602],[32.672218,-117.078873],[32.660557,-117.08622],[32.6571542,-117.0905529],[32.658844,-117.095734]]]
			}
			console.log(output);
			res.send(output);
		});
	});*/
};

/*
function calcCircle(centerCoordinates, radius) {
    var coordinatesArray = new Array();
    var octantArrays =
      {oct1: new Array(), oct2: new Array(), oct3: new Array(), oct4: new Array(),
       oct5: new Array(), oct6: new Array(), oct7: new Array(), oct8: new Array()};
    // Translate coordinates
    var xp = centerCoordinates.left;
    var yp = centerCoordinates.top;
    // Define add coordinates to array
    var setCrd =
      function (targetArray, xC, yC) {
        targetArray.push(new Coordinates(yC, xC));
      };
    // Define variables
    var xoff = 0;
    var yoff = radius;
    var balance = -radius;
    // Main loop
    while (xoff <= yoff) {
      // Quadrant 7 - Reverse
      setCrd(octantArrays.oct7, xp + xoff, yp + yoff);
      // Quadrant 6 - Straight
      setCrd(octantArrays.oct6, xp - xoff, yp + yoff);
      // Quadrant 3 - Reverse
      setCrd(octantArrays.oct3, xp - xoff, yp - yoff);
      // Quadrant 2 - Straight
      setCrd(octantArrays.oct2, xp + xoff, yp - yoff);
      // Avoid duplicates
      if (xoff != yoff) {
        // Quadrant 8 - Straight
        setCrd(octantArrays.oct8, xp + yoff, yp + xoff);
        // Quadrant 5 - Reverse
        setCrd(octantArrays.oct5, xp - yoff, yp + xoff);
        // Quadrant 4 - Straight
        setCrd(octantArrays.oct4, xp - yoff, yp - xoff);
        // Quadrant 1 - Reverse
        setCrd(octantArrays.oct1, xp + yoff, yp - xoff);
      }
      // Some weird stuff
      balance += xoff++ + xoff;
      if (balance >= 0) {
        balance -= --yoff + yoff;
      }
    }
    // Reverse counter clockwise octant arrays
    octantArrays.oct7.reverse();
    octantArrays.oct3.reverse();
    octantArrays.oct5.reverse();
    octantArrays.oct1.reverse();
    // Remove counter clockwise octant arrays last element (avoid duplicates)
    octantArrays.oct7.pop();
    octantArrays.oct3.pop();
    octantArrays.oct5.pop();
    octantArrays.oct1.pop();
    // Append all arrays together
    coordinatesArray =
      octantArrays.oct4.concat(octantArrays.oct3).concat(octantArrays.oct2).concat(octantArrays.oct1).
        concat(octantArrays.oct8).concat(octantArrays.oct7).concat(octantArrays.oct6).concat(octantArrays.oct5);
    // Return the result
    return coordinatesArray;
  }


function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
*/

exports.findPolygonArea = function(req, res) {
	console.log('findPolygonArea');
	db.collection('polygons', function(err, collection) {
		collection.find().toArray(function(err, items) {
			res.send(items);
		});
	});
};


exports.addSportEvent = function(req, res) {
	var sportevent = req.body;
	console.log('Adding event: ' + JSON.stringify(sportevent));
	db.collection('sportevents', function(err, collection) {
	collection.insert(sportevent, {safe:true}, function(err, result) {
		if (err) {
			res.send({'error':'An error has occurred'});
		} else {
			console.log('Success: ' + JSON.stringify(result[0]));
			res.send(result[0]);
		}
	});
});
};

exports.updateSportEvent = function(req, res) {
	var id = req.params.id;
	var sportEvent = req.body;
	console.log('Updating event: ' + id);
	console.log(JSON.stringify(sportEvent));
	db.collection('sportevents', function(err, collection) {
	collection.update({'_id':new BSON.ObjectID(id)}, sportevent, {safe:true}, function(err, result) {
		if (err) {
			console.log('Error updating event: ' + err);
			res.send({'error':'An error has occurred'});
		} else {
			console.log('' + result + ' document(s) updated');
			res.send(sportEvent);
		}
	});
});
};

exports.deleteSportEvent = function(req, res) {
	var id = req.params.id;
	console.log('Deleting event: ' + id);
	db.collection('sportevents', function(err, collection) {
	collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
		if (err) {
			res.send({'error':'An error has occurred - ' + err});
		} else {
			console.log('' + result + ' document(s) deleted');
			res.send(req.body);
		}
	});
});
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
exports.populateSportEvents = function(req, res) {

	var sportevents = [
	{
		"accessible_wheelchair":true,
		"address":"925 E Plaza Blvd",
		"alcohol": true,
		"alcohol_beer_wine":true,
		"attire":"casual",
		"category":"Food & Beverage > Restaurants > Sushi",
		"country":"US",
		"cuisine":"Japanese, Sushi",
		"factual_id":"317ced43-30c4-4e70-a3bd-3a5db4e45d88",
		"groups_goodfor":true,
		"kids_goodfor":true,
		"latitude":41.1392,
		"locality":"National City",
		"longitude":29.1947,
		"meal_deliver":false,
		"meal_dinner":true,
		"meal_lunch":true,
		"meal_takeout":true,
		"name":"Besiktas - Buca",
		"parking":true,
		"parking_lot":true,
		"payment_cashonly":false,
		"postcode":"91950",
		"price":2,
		"rating":3.5,
		"region":"CA",
		"reservations":true,
		"seating_outdoor": false,
		"status":"1",
		"tel":"(619) 474-2918",
		"distance":862.674,
		"travel_time_seconds":995,
		"travel_time_formatted":"12 mins",
		"distance":"0.64"
	},

	{
		"accessible_wheelchair":true,
		"address":"925 E Plaza Blvd",
		"alcohol": true,
		"alcohol_beer_wine":true,
		"attire":"casual",
		"category":"Food & Beverage > Restaurants > Sushi",
		"country":"US",
		"cuisine":"Japanese, Sushi",
		"factual_id":"317ced43-30c4-4e70-a3bd-3a5db4e45d88",
		"groups_goodfor":true,
		"kids_goodfor":true,
		"latitude":41.048183,
		"locality":"National City",
		"longitude":28.953574,
		"meal_deliver":false,
		"meal_dinner":true,
		"meal_lunch":true,
		"meal_takeout":true,
		"name":"Karsiyaka - Kasimpasa",
		"parking":true,
		"parking_lot":true,
		"payment_cashonly":false,
		"postcode":"91950",
		"price":2,
		"rating":3.5,
		"region":"CA",
		"reservations":true,
		"seating_outdoor": false,
		"status":"1",
		"tel":"(619) 474-2918",
		"distance":862.674,
		"travel_time_seconds":995,
		"travel_time_formatted":"17 mins",
		"distance":"0.54"
	}
	];

	var polygons = [[[32.658844,-117.095734],[32.664352,-117.110397],[32.665211,-117.110733],[32.668373,-117.109688],[32.672939,-117.106956],[32.682457,-117.100403],[32.680431,-117.090553],[32.675617,-117.080437],[32.6740959,-117.0789602],[32.672218,-117.078873],[32.660557,-117.08622],[32.6571542,-117.0905529],[32.658844,-117.095734]]];



	db.collection('sportevents', function(err, collection) {
		console.log('Before insertion');
	  collection.insert(sportevents, {safe:true}, function(err, result) {

		if(err){
			console.log(err);
		}


	});
	console.log('After insertion');
});



db.collection('polygons', function(err, collection) {
	console.log('Before insertion');
  collection.insert(polygons, {safe:true}, function(err, result) {
	if(err){
		console.log(err);
	}


});
console.log('After insertion');
});

};
