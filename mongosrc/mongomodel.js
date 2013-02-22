var fs = require('fs'),
xml2js = require('xml2js');
var async = require('async');
var async2 = require('async');
var sys = require('sys');

var mongoose = require('mongoose'), Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://127.0.0.1:27017/test');

/*Object Model*/
var sportSchema = Schema({
    gsId: String
    ,name: String
});

var sportTypeSchema = Schema({
    gsId: String
    , name: String
});

var placeTypeSchema = Schema({
    gsId: String
    , name: String
});


var placeSchema = new Schema({
    gsId: String
  , name    : String
  , placetypeId : { type: Schema.ObjectId, ref: 'PlaceType' }
  , logos                 : [String]
  , address            : String
  , city                     : String
  , longitude: String
  , latitude:  String
  , photos: [String]
  , seatingcapacity: String
});


var teamSchema = new Schema({
  _id : Schema.ObjectId
  , gsId: String
  , name    : String
  , placeId : { type: Schema.ObjectId, ref: 'Place' }
  , logos   : [String]
  , city    : String
  , country : String
});

var organizationSchema = new Schema({
   gsId: String
  , name : String
  , start_date: Date
  , end_date: Date
  , sportsId     : { type: Schema.ObjectId, ref: 'SportType' }
});

var eventSchema = new Schema({
    gsId: String
  , name : String
  , start_date: Date
  , end_date: Date
  , placeId     : { type: Schema.ObjectId, ref: 'Place' }
  , orgId     : { type: Schema.ObjectId, ref: 'Organization' }
  , homeTeamId     : { type: Schema.ObjectId, ref: 'Team' }
  , awayTeamId     : { type: Schema.ObjectId, ref: 'Team' }
});
 
var Sport = mongoose.model('Sport', sportSchema);
var SportType = mongoose.model('SportType', sportTypeSchema);
var Organization = mongoose.model('Organization', organizationSchema);
var Place = mongoose.model('Place', placeSchema);
var PlaceType = mongoose.model('PlaceType', placeTypeSchema);
var Team = mongoose.model('Team', teamSchema);
var Event = mongoose.model('Event', eventSchema);



/*Main DB population steps. Works step by step*/
async.waterfall([
	
	function(callback) {
		sys.log("started");
		callback(null,'Initialized!');

	}, 
	
	/*Placetypes inserted in an upsert manner.*/
	function(arg1, callback) {
		console.log(arg1);
		var parser1 = new xml2js.Parser();
		fs.readFile(__dirname + '/placetypes.xml', function(err, data) {
		    parser1.parseString(data, function (err, result) {
		    	var arr = result.PlaceTypes.PlaceType;
		    	for(var i=0; i<arr.length; i++) {
		    	  var obje = arr[i]['$'];
			  		PlaceType.update({gsId : obje.gsId},{gsId : obje.gsId, name: obje.name },{upsert: true}, function(err, data) {});
		    	}
		    });
		});

		callback(null,'PlaceTypes Inserted!');
	}, 
	
	/*Places inserted in an upsert manner. Their placetypeId references are also created.*/
	function(arg1, callback) {
		console.log(arg1);

		var parser1 = new xml2js.Parser();
		fs.readFile(__dirname + '/places.xml', function(err, data) {
		    parser1.parseString(data, function (err, result) {
		    var arr = result.Places.Place;
		    var objArray = new Array();
		    for(var i=0; i<arr.length; i++) {
		    	  var obje = arr[i]['$'];
		    	  objArray.push(obje);
		    }
		    /* For each place read, create its reference to placetypes*/
				async2.eachSeries(objArray, placeInsert, function(err) {
			    sys.log("finished");
				});
		    });
		});
		callback(null,'Places Inserted!');
	},
	
	/*Placetypes inserted in an upsert manner.*/
	function(arg1, callback) {
		console.log(arg1);

		var parser1 = new xml2js.Parser();
		fs.readFile(__dirname + '/sporttypes.xml', function(err, data) {
		    parser1.parseString(data, function (err, result) {
		    	var arr = result.SportTypes.SportType;
		    	for(var i=0; i<arr.length; i++) {
		    	  var obje = arr[i]['$'];
			  		SportType.update({gsId : obje.gsId},{gsId : obje.gsId,name: obje.name },{upsert: true}, function(err, data) {});
		    	}
		    });
		});

		callback(null,'SportTypes Inserted!');
	},
	/*TODO: Teams will be inserted in an upsert manner.*/
	function(arg1, callback) {
		console.log(arg1);


		callback(null,'Teams Inserted!');
	}
	],
function (err, caption) {
        console.log(caption);
    }
);	





/*Place Insert function. First it finds the placetype reference, and then insert the place together with its reference.*/
var placeInsert = function(arg, callback) {
	var obj = JSON.stringify(arg);
	var obje = JSON.parse(obj);
	
	async2.waterfall([
			/*Find referenced placetype*/
			function(callb) {
			  PlaceType.findOne({gsId : obje.typeId}, function(err, item){
			    callb(null, item, obje);
			  });
			},

			/*Upsert place together with reference*/
			function(arg2,arg1, callb) {
			  Place.update({gsId : obje.gsId},{name: obje.name , logos: obje.logos, placetypeId : arg2, latitude: obje.latitude,longitude:obje.longitude},{upsert: true}, function(err, data) {
			  	if(err)
			  		console.log(err);
			  	
			  	});
			  callback(null,'Place Inserted!');
			}
		],
		function (err, caption) {
      			callback();
  		}
	);
}

/*Query the place with id=1 and populate its references for testing purposes*/
Place.findOne({gsId : '1'}).populate('placetypeId').exec(function(err, pl) { 
	console.log("{gsId:1} populated - ",pl);
})
