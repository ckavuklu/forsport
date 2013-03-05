var fs = require('fs'),
xml2js = require('xml2js');
var async = require('async');
var sys = require('sys');

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
  , loc: {type: [Number], index: '2d'}
  , photos: [String]
  , capacity: String
});


var teamSchema = new Schema({
    teamId: String
  , tffTeamId: String
  , tffClubId: String
  , placeId: String
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
			  	PlaceType.update({placeTypeId : obje.placeTypeId},{placeTypeId : obje.placeTypeId, name: obje.name },{upsert: true}, function(err, data) {});
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
				async.eachSeries(objArray, placeInsert, function(err) {
			    		sys.log("place finished");
				});
		    });
		});
		callback(null,'Places Inserted!');
	},
	
	/*Sporttypes inserted in an upsert manner.*/
	function(arg1, callback) {
		console.log(arg1);

		var parser1 = new xml2js.Parser();
		fs.readFile(__dirname + '/sporttypes.xml', function(err, data) {
		    parser1.parseString(data, function (err, result) {
		    	var arr = result.SportTypes.SportType;
		    	for(var i=0; i<arr.length; i++) {
		    	  var obje = arr[i]['$'];
			  		SportType.update({sportTypeId : obje.sportTypeId},{sportTypeId : obje.sportTypeId,name: obje.name },{upsert: true}, function(err, data) {});
		    	}
		    });
		});

		callback(null,'SportTypes Inserted!');
	},
	/*TODO: Teams will be inserted in an upsert manner.*/
	function(arg1, callback) {
		console.log(arg1);

		
		var parser1 = new xml2js.Parser();
		fs.readFile(__dirname + '/teams.xml', function(err, data) {
		    parser1.parseString(data, function (err, result) {
		    var arr = result.Teams.Team;
		    var objArray = new Array();
		    for(var i=0; i<arr.length; i++) {
		    	  var obje = arr[i]['$'];
		    	  objArray.push(obje);
		    }
		    /* For each place read, create its reference to placetypes*/
				async.eachSeries(objArray, teamInsert, function(err) {
			    		sys.log("team finished");
				});
		    });
		});


		callback(null,'Teams Inserted!');
	},
	/*TODO: Events will be inserted in an upsert manner.*/
	function(arg1, callback) {
		console.log(arg1);

		
		var parser1 = new xml2js.Parser();
		fs.readFile(__dirname + '/events.xml', function(err, data) {
		    parser1.parseString(data, function (err, result) {
		    var arr = result.Events.Event;
		    var objArray = new Array();
		    for(var i=0; i<arr.length; i++) {
		    	  var obje = arr[i]['$'];
		    	  objArray.push(obje);
		    }
		    /* For each place read, create its reference to placetypes*/
				async.eachSeries(objArray, eventInsert, function(err) {
					if(err)
					sys.log(err);
			    		sys.log("event finished");
				});
		    });
		});


		callback(null,'Events Inserted!');
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
	
	async.waterfall([
			/*Find referenced placetype*/
			function(callb) {
			  PlaceType.findOne({placeTypeId : obje.typeId}, function(err, item){
			    callb(null, item, obje);
			  });
			},

			/*Upsert place together with reference*/
			function(arg2,arg1, callb) {
			  Place.update({placeId : arg1.placeId},{name: arg1.name , typeId : arg2, loc: [parseFloat(arg1.latitude),parseFloat(arg1.longitude)],tffPlaceId:arg1.tffPlaceId,address:arg1.address,city:arg1.city,country:arg1.country,photos:arg1.photos},{upsert: true}, function(err, data) {
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





/*Team Insert function. First it finds the sporttype and place references, and then insert the team together with their references.*/
var teamInsert = function(arg, callback) {
	var obj = JSON.stringify(arg);
	var obje = JSON.parse(obj);
	
	async.waterfall([
			/*Find referenced place*/
			function(callb) {
			  Place.findOne({tffPlaceId : obje.placeId}, function(err, item){
			  if(err)
			  console.log(err);
			  
			  callb(null, item, obje);
			  });
			},

			/*Find referenced sporttype*/
			function(arg2,arg1, callb) {
			  SportType.findOne({sportTypeId : arg1.sportTypeId},function(err, item) {
			  	if(err)
			  		console.log(err);

			  	callb(null, item, arg2, arg1);
			  	
			 });
			},

			/*Upsert place together with references*/
			function(arg2,arg1,argO, callb) {
			  Team.update({teamId : argO.teamId},{name: argO.name , tffTeamId: argO.tffTeamId ,tffClubId: argO.tffClubId ,placeId : arg1, sportTypeId : arg2, logo: argO.logo,city:argO.city,region:argO.region,website:argO.website,country:argO.country},{upsert: true}, function(err, data) {
			  	if(err)
			  		console.log(err);
			  	
			  	});
			  callback(null,'Team Inserted!');
			}
		],
		function (err, caption) {
      			callback();
  		}
	);
}


/*Team Insert function. First it finds the sporttype and place references, and then insert the team together with their references.*/
var eventInsert = function(arg, callback) {
	var obj = JSON.stringify(arg);
	var obje = JSON.parse(obj);
	
	async.waterfall([
			/*Find referenced place*/
			function(callb) {
			  Place.findOne({tffPlaceId : obje.placeID}, function(err, item){
			  if(err)
			  	console.log("err",err);
			  callb(null, item, obje);
			  });
			},

			/*Find referenced sporttype*/
			/*arg2: place, arg1:object*/
			function(arg2, arg1, callb) {
			  Team.findOne({tffClubId : arg1.hometeamID},function(err, item) {
			  	if(err)
			  		console.log(err);
			  	callb(null, item, arg2, arg1);
			  	
			 });
			},
			
			/*Find referenced sporttype*/
			/*arg2: homeTeamId, arg1:place, arg0:object*/
			function(arg2,arg1,arg0, callb) {
			  Team.findOne({tffClubId : arg0.awayteamID},function(err, item) {
			  	if(err)
			  		console.log(err);

			  	callb(null, item, arg2, arg1,arg0);
			  	
			 });
			},

			/*Upsert place together with references*/
			/*arg3: awayTeamId, arg2: homeTeamId, arg1:place, arg0:object*/
			function(arg3,arg2,arg1,argO, callb) {
				
				//new Date(1995,11,17)
				var str=argO.eventdate;
				var strTime=argO.eventtime;
				var dateArray=str.split(".",3);
				var timeArray=strTime.split(":",2);
				console.log(dateArray[2],dateArray[1],dateArray[0],timeArray[0],timeArray[1]);
			  Event.update({matchId : argO.matchID},{week: argO.week , hometeamId: arg2 ,awayteamId: arg3 ,placeId : arg1, eventDate : new Date(dateArray[2],dateArray[1]-1,dateArray[0],timeArray[0],timeArray[1],0), eventTime : argO.eventtime},{upsert: true}, function(err, data) {
			  	if(err)
			  		console.log(err);
			  	});
			  callb(null,'Event Inserted!');
			}
		],
		function (err, caption) {
      			callback();
  		}
	);
}


/*Query the place with id=1 and populate its references for testing purposes*/
Place.findOne({placeId : '1'}).populate('typeId').exec(function(err, pl) { 
	console.log("{placeId:1} populated - ",pl);
})
