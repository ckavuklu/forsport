var fs = require('fs'),
xml2js = require('xml2js');
var async = require('async');
var sys = require('sys');
ntwitter = require('ntwitter');

var mongoose = require('mongoose'), Schema = mongoose.Schema;


// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var uristring = 
  process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://127.0.0.1:27017/test';

var db = mongoose.connect(uristring);

/*Object Model*/
var sportSchema = Schema({
    sportId: String
    ,
    name: String
});

var sportTypeSchema = Schema({
    sportTypeId: String
    , 
    name: String
});

var placeTypeSchema = Schema({
    placeTypeId: String
    , 
    name: String
});

var placeSchema = new Schema({
    placeId: String
    , 
    refPlaceId: String
    , 
    name: String
    , 
    typeId : {
        type: Schema.ObjectId, 
        ref: 'PlaceType'
    }
    , 
    address: String
    , 
    city: String
    , 
    country: String
    , 
    loc : {
        type: [Number], 
        index: '2d'
    }
    , 
     
    capacity: String
});

var teamSchema = new Schema({
    teamId: String
    , 
    refTeamId: String
    , 
    name    : String
    , 
    placeId : {
        type: Schema.ObjectId, 
        ref: 'Place'
    }
    , 
    sportTypeId : {
        type: Schema.ObjectId, 
        ref: 'SportType'
    }
    , 
    city    : String
    , 
    country : String
    , 
    website : String
});

var organizationSchema = new Schema({
    orgId: String
    , 
    name : String
    , 
    start_date: Date
    , 
    end_date: Date
    , 
    sportsId     : {
        type: Schema.ObjectId, 
        ref: 'SportType'
    }
});

var eventSchema = new Schema({
    week: String
    , 
    checkInCount: { type: Number, default: 0 },

    matchId : String
    , 
    hometeamId: {
        type: Schema.ObjectId, 
        ref: 'Team'
    }
    , 
    awayteamId: {
        type: Schema.ObjectId, 
        ref: 'Team'
    }
    , 
    eventDate: Date
    , 
    eventTime: String
    , 
    placeId     : {
        type: Schema.ObjectId, 
        ref: 'Place'
    }
    , 
    eventTypeId     : {
        type: Schema.ObjectId, 
        ref: 'SportType'
    }
    , 
    eventDescription     : String,

    orgId     : {
        type: Schema.ObjectId, 
        ref: 'Organization'
    },

    tweets:   [String]
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
        collection.findOne({
            '_id':new BSON.ObjectID(id)
            }, function(err, item) {
            res.send(item);
        });
    });
};


exports.populatedb = function(req, res) {

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
                        PlaceType.update({
                            placeTypeId : obje.placeTypeId
                            },{
                            placeTypeId : obje.placeTypeId, 
                            name: obje.name
                        },{
                            upsert: true
                        }, function(err, data) {});
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
                        async.waterfall([
                            function(callback) {
                                sys.log("started");
                                callback(null,'Initialized!');

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
                                            SportType.update({
                                                sportTypeId : obje.sportTypeId
                                                },{
                                                sportTypeId : obje.sportTypeId,
                                                name: obje.name
                                            },{
                                                upsert: true
                                            }, function(err, data) {
					    
					    	var parser1 = new xml2js.Parser();
            fs.readFile(__dirname + '/organizations.xml', function(err, data) {
                parser1.parseString(data, function (err, result) {
                    var arr = result.Organizations.Organization;
                    for(var i=0; i<arr.length; i++) {
                        var obje = arr[i]['$'];
                        Organization.update({
			orgId : obje.orgId
                            },{
                            orgId : obje.orgId,
                            name: obje.name
                        },{
                            upsert: true
                        }, function(err, data) {});
                    }
                });
            });					    
					    
					    
					    
					    
					    
					    
					    
					    
					    
					    });
                                        }
                                    });
                                });

                                callback(null,'SportTypes Inserted!');
                            },
				
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
							
                                        async.eachSeries(objArray, teamInsert, function(err) {
							
                                            var parser1 = new xml2js.Parser();
                                            fs.readFile(__dirname + '/events.xml', function(err, data) {
                                                parser1.parseString(data, function (err, result) {
                                                    var arr = result.Events.Event;
                                                    var objArray = new Array();
                                                    for(var i=0; i<arr.length; i++) {
                                                        var obje = arr[i]['$'];
                                                        objArray.push(obje);
                                                    }
									
                                                    async.eachSeries(objArray, eventInsert, function(err) {
                                                        if(err)
                                                            sys.log(err);
										
                                                        sys.log("Events finished");
                                                        res.send("Events finished");
                                                    });
                                                });
                                            });

							
                                        //sys.log("team finished");
							
							
							
							
							
                                        });
                                    });
                                });


                                callback(null,'Teams Inserted!');
                            }

                            ],
                            function (err, caption) {
                                console.log('Teams finished!!!!');
                            }
                            );
                    });
                });
                callback(null,'Places Inserted!');
            });
        }
        ]

        ,
        function (err, caption) {
            console.log(caption);
        }
        );

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

exports.retrieveTweets = function(req, res) {
    var hometeamtag = req.query["hometeamtag"];
    var awayteamtag = req.query["awayteamtag"];
    var eventtag = req.query["eventtag"];

   var twit = new ntwitter({
    consumer_key: '3Ao9nKhiGpDOHgPN9ig9aQ',
    consumer_secret: 'h4zVh4b1POOejs6nLwEjJlEWH1deevFrE53Qu05Eys',
    access_token_key: '307521206-ImCEM2EtT51QCbYF1dullzMBBL1g4e3SmBks0dCK',
    access_token_secret: 'p9fjvGlg3tiGs7GbU1ln6qAHuqAPiM7Db5l5kvyDfg'
  });

   twit
   .verifyCredentials(function (err, data) {
    console.log("Verifying Credentials...");
    if(err)
      console.log("Verification failed : " + err)

  }).search("\"" + hometeamtag + "\"" + ' OR ' + "\"" + awayteamtag + "\"" + ' OR ' + "\"" + eventtag + "\"", {
    count: 5}, function(err, data) {
     res.send({
          tweets: data
      });
  }
  
);

}





exports.findAllSportEvents = function(req, res) {
    var searchString = req.query["q"];
    var ll = req.query["ll"];
    var tokens = ll.split(",");
    var lat = 0, lon = 0;
    var dist = 0;
    var nowDate = new Date();
    var nextDate = new Date();
    var returnObject = new Array();



    if (tokens.length == 2) {
        lat = parseFloat(tokens[0]);
        lon = parseFloat(tokens[1]);
    }

    if(searchString.substring(0,4) == "TYPE"){

        var searchToken = searchString.substring(5);
        console.log(searchToken);

        if(searchToken == "BESTNEARBY")
        {
            nextDate.setDate(nowDate.getDate()+7);
            dist = 100.0;
            Event.find({
                eventDate : {
                    $gt: nowDate, 
                    $lt: nextDate
                }
            }).populate('placeId', null, {
            loc: {
                $maxDistance: dist/111.2, 
                $near: [lat,lon]
                }
            }).populate('hometeamId').populate('awayteamId').populate('eventTypeId').populate('orgId').exec(function(err, pl) { 

	    res.send({
            events: pl
        });



    });
}else{
    nextDate.setDate(nowDate.getDate()+60);
	    
    dist = 100.0;
    Event.find({
        eventDate : {
            $gt: nowDate, 
            $lt: nextDate
        }
    }).populate('placeId', null, {
    loc: {
        $maxDistance: dist/111.2, 
        $near: [lat,lon]
        }
    }).populate('eventTypeId',null,{
    'name' : searchToken
}).populate('hometeamId').populate('awayteamId').populate('orgId').exec(function(err, pl) { 
    res.send({
        events: pl
    });
});

}
	  
	  
}else{
    //User manually input the text or click on an item
    nextDate.setDate(nowDate.getDate()+60);
	     
    Event.find({
        eventDate : {
            $gt: nowDate, 
            $lt: nextDate
        }, 
        eventDescription:{
            $regex: new RegExp(searchString, 'gi')
        }
    }).populate('placeId').populate('hometeamId').populate('awayteamId').populate('orgId').populate('eventTypeId').exec(function(err, pl) { 
    res.send({
        events: pl
    });
});


}
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
        collection.insert(sportevent, {
            safe:true
        }, function(err, result) {
            if (err) {
                res.send({
                    'error':'An error has occurred'
                });
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
    


    console.log("searching for: ", id);

    Event.update({
                matchId : id
                },{$inc: { checkInCount : 1}},{
                upsert: true
            }, function(err, data) {
                if(err)
                    console.log(err);
            });

    Event.findOne({matchId : id}, function(err, data) {
                if(err)
                    console.log(err);
		console.log("result: ", data);		    
	        res.send(data);
            });

/*
    db.collection('sportevents', function(err, collection) {
        collection.update({
            'matchId':new BSON.ObjectID(id)
            }, sportevent, {
            safe:true
        }, function(err, result) {
            if (err) {
                console.log('Error updating event: ' + err);
                res.send({
                    'error':'An error has occurred'
                });
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(sportEvent);
            }
        });
    });*/
};

exports.deleteSportEvent = function(req, res) {
    var id = req.params.id;
    console.log('Deleting event: ' + id);
    db.collection('sportevents', function(err, collection) {
        collection.remove({
            '_id':new BSON.ObjectID(id)
            }, {
            safe:true
        }, function(err, result) {
            if (err) {
                res.send({
                    'error':'An error has occurred - ' + err
                    });
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};




/*Place Insert function. First it finds the placetype reference, and then insert the place together with its reference.*/
var placeInsert = function(arg, callback) {
    var obj = JSON.stringify(arg);
    var obje = JSON.parse(obj);

    async.waterfall([
        /*Find referenced placetype*/
        function(callb) {
            PlaceType.findOne({
                placeTypeId : obje.typeId
                }, function(err, item){
                callb(null, item, obje);
            });
        },

        /*Upsert place together with reference*/
        function(arg2,arg1, callb) {
            Place.update({
                placeId : arg1.placeId
                },{
                name: arg1.name , 
                typeId : arg2, 
                loc: [parseFloat(arg1.latitude),parseFloat(arg1.longitude)],
                refPlaceId:arg1.refPlaceId,
                address:arg1.address,
                city:arg1.city,
                country:arg1.country
                },{
                upsert: true
            }, function(err, data) {
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
            Place.findOne({
                refPlaceId : obje.placeId
                }, function(err, item){
                if(err)
                    console.log(err);

                callb(null, item, obje);
            });
        },

        /*Find referenced sporttype*/
        function(arg2,arg1, callb) {
            SportType.findOne({
                sportTypeId : arg1.sportTypeId
                },function(err, item) {
                if(err)
                    console.log(err);

                callb(null, item, arg2, arg1);

            });
        },

        /*Upsert place together with references*/
        function(arg2,arg1,argO, callb) {
            Team.update({
                teamId : argO.teamId
                },{
                name: argO.name , 
                refTeamId: argO.refTeamId ,
                placeId : arg1, 
                sportTypeId : arg2, 
                city:argO.city,
                website:argO.website,
                country:argO.country
                },{
                upsert: true
            }, function(err, data) {
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
            Place.findOne({
                refPlaceId : obje.placeID
                }, function(err, item){
                if(err)
                    console.log("err",err);
                callb(null, item, obje);
            });
        },

        /*arg2: place, arg1:object*/
        function(arg2, arg1, callb) {
            Team.findOne({
                refTeamId : arg1.hometeamID
                },function(err, item) {
                if(err)
                    console.log(err);
                callb(null, item, arg2, arg1);

            });
        },

        /*arg2: homeTeamId, arg1:place, arg0:object*/
        function(arg2,arg1,arg0, callb) {
            Team.findOne({
                refTeamId : arg0.awayteamID
                },function(err, item) {
                if(err)
                    console.log(err);

                callb(null, item, arg2, arg1,arg0);

            });
        },

        /*arg3: sportTypeId,arg2: homeTeamId, arg1:place, arg0:object*/
        function(arg3,arg2,arg1,arg0, callb) {
            SportType.findOne({
                sportTypeId : arg0.eventtypeID
                },function(err, item) {
                if(err)
                    console.log(err);

                callb(null, item, arg3, arg2, arg1,arg0);

            });
        },

	        /*Upsert place together with references*/
        /*arg4: sportTypeId,arg3: awayTeamId, arg2: homeTeamId, arg1:place, arg0:object*/
        function(arg4,arg3,arg2,arg1,arg0, callb) {
	 Organization.findOne({
                orgId : arg0.orgID
                },function(err, item) {
                if(err)
                    console.log(err);

                callb(null, item, arg4, arg3, arg2, arg1,arg0);

            });

	},


        /*Upsert place together with references*/
        /*arg5: orgId,arg4: sportTypeId,arg3: awayTeamId, arg2: homeTeamId, arg1:place, arg0:object*/
        function(arg5,arg4,arg3,arg2,arg1,argO, callb) {

            //new Date(1995,11,17)
            var str=argO.eventdate;
            var strTime=argO.eventtime;
            var dateArray=str.split(".",3);
            var timeArray=strTime.split(":",2);
            console.log(dateArray[2],dateArray[1],dateArray[0],timeArray[0],timeArray[1]);
            Event.update({
                matchId : argO.matchID
                },{
                week: argO.week , 
                hometeamId: arg2 ,
                awayteamId: arg3 ,
                eventTypeId: arg4 ,
                orgId: arg5 ,
                placeId : arg1, 
                eventDate : new Date(dateArray[2],dateArray[1]-1,dateArray[0],timeArray[0],timeArray[1],0), 
                eventTime : argO.eventtime, 
                eventDescription: arg2.name + '-' + arg3.name + '-' +arg1.name + '-' +arg4.name
                },{
                upsert: true
            }, function(err, data) {
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

