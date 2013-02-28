var http = require("http"),
url = require("url"),
jsdom = require("jsdom"),
async = require("async"),
path = require("path"),
fs = require("fs");

var express = require('express');
sportevents = require('./routes/sportevents.js');

var app = express();

var RESULT_XML;

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



app.get('/tffsuperlig', function(req, res){
        
        var days = new Array();
        
        RESULT_XML = "<?xml version=\"1.0\" encoding=\"ISO-8859-9\"?> <Events org=\"tffsuperlig\">";
        
        
        for(var i=1;i<35;i++){
            days.push(i);
        }
        
        async.eachSeries(days,getDayMatches,function(err){
                         
                         console.log('end of operation');
                         
                         RESULT_XML += "</Events>" ;
                         // console.log(RESULT_XML);
                         
                         fs.writeFile("tff_superlig_2012-2013.xml", RESULT_XML, function(err) {
                                      if(err) {
                                      console.log(err);
                                      } else {
                                      console.log("The file was saved!");
                                      }
                                      });
                         
                       
                         res.end('Done');
                         
                         });
        
        
        }); // end of app.get('/tff2...

function getDayMatches(day, callback){

    console.log('day is : ' + day);


    async.waterfall([
                     
                     function(callback1){
                     
                             var targeturl = 'http://www.tff.org/Default.aspx?pageID=198&hafta='+ day +'#macctl00_MPane_m_198_935_ctnr_m_198_935';

                             
                             request({uri: targeturl, timeout : 60000, method : "GET"  }, function(err, response, body){
                                     
                             if(err) {console.log(" error for DayMatches requests : " + err);}
                             
                             if(response && response.statusCode !== 200){console.log('Request error.');}
                             
                             callback1(null,body);
                             
                             });
                     
                     },
                     
                     function(body, callback2) {
                      
                      console.log('Games will be looked for...');
                     
                             jsdom.env({
                                       html: body,
                                       scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                                       }, function(err, window){
                                       //Use jQuery just as in a regular HTML page
                                       
                                       
                                       if(err) console.log(" error for jsdom : " + err);
                                       
                                       var $ = window.$,
                                       $gametable  = $("#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari"),
                                       $matches    = $gametable.find('div');
                                       
                                       
                                       var games = new Array();
                                       
                                       $matches.each(
                                                     function(i,item){
                                                     var game;
                                                     
                                                     var   $hometeamspanID  = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_A2",
                                                     $awayteamspanID  = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_A5",
                                                     $matchspanID     = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_A3",
                                                     $datespanID      = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblTarih",
                                                     $timespanID      = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                                     
                                                     var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                                     $awayteamspanElm   = $(item).find($awayteamspanID),
                                                     $matchspanElm      = $(item).find($matchspanID),
                                                     $datespanElm       = $(item).find($datespanID),
                                                     $timespanElm       = $(item).find($timespanID);
                                                     
                                                     var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                                     awayteam_linktext   = $awayteamspanElm.attr('href'),
                                                     match_linktext      = $matchspanElm.attr('href');
                                                     
                                                     game =  {
                                                     
                                                         gameday       : day,
                                                         hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                                         awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                                         matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                                         date          : $datespanElm.text(),
                                                         time          : $timespanElm.text(),
                                                         placeID       : ""
                                                     
                                                     };
                                                     
                                                     games.push(game);
                                                     
                                                     // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;

                                                     //console.log(matchID);
                                                     });
                                       
                                       
                                       
                                       console.log("Games found!");
                                       console.log(games);
                                       callback2(null,games);
                                       
                                       
                                       });
                     
                        },
                     
                     function(games,callback3){
                     
                      
                      console.log('Game Places will be looked for...');
                      
                      async.eachSeries(games,getGamePlace,function(err){
                                        
                                        console.log('Games Places retrieved!');
                                        
                                        callback3(null);
                                        
                                        });
                      
                     }
                     
                     ],
                    
                    function(err){
                    
                        console.log("all games for day #" + day + " found!");

                        callback(); //callback for getDayMatches
                    
                    });
}

function getGamePlace(game,callback){

    console.log("Place looked for game : " + game.matchID);
    
    
    
    async.waterfall([
                     
                      function(callback4){
                      
                            request({uri: 'http://www.tff.org/Default.aspx?pageId=29&macId=' + game.matchID, timeout : 60000, method : "GET"}, function(err, response, body){
                                  
                                if(err) {console.log(" error for place retrieval : " + err);}
                                   
                                if(response && response.statusCode !== 200){ console.log('Request error.');}
                                
                                console.log("Body found!");
                                         
                                callback4(null, body);
                                     
                                     });
                      
                      }
                      ,
                      
                      function(body,callback5){
                      
                          jsdom.env({

                                    html: body,
                                    scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                                    
                                    }, function(err, window){
                                        
                                        if(err) console.log(" error for jsdom : " + err);
                                     
                                        var $ = window.$;

                                        var $matchplaceElm      = $("#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_lnkStad"),
                                        
                                        matchplace_linktext     = $matchplaceElm.attr('href');
                                        
                                        callback5(null,matchplace_linktext.substring(matchplace_linktext.lastIndexOf("=")+1));
                                    
                                    });
                      
                      }
                     ],
                     
                     
                     
                     function(err, placeID){
                     
                        game.placeID = placeID;
                     
                        console.log('Place found for game : ' + game.matchID + ' is : ' + game.placeID);
                    
                        RESULT_XML += ("<Event week=\""+game.gameday+"\" matchID=\""+ game.matchID+"\" hometeamID=\""+game.hometeamID+"\" awayteamID=\""+game.awayteamID+"\" placeID=\""+game.placeID+"\" eventdate=\""+game.date+"\" eventtime=\""+game.time+"\"/>") ;
                    
                         
                        callback();
                     
                     });
     
    
    
  //callback();
    
}

app.get('/tffbirincilig', function(req, res){
        
        var days = new Array();
        
        RESULT_XML = "<?xml version=\"1.0\" encoding=\"ISO-8859-9\"?> <Events org=\"tffbirincilig\">";
        
        for(var i=1;i<35;i++){
        days.push(i);
        }
        
        async.eachSeries(days,getDayMatchesForBirinciLig,function(err){
                         
                         console.log('end of operation');
                         
                         RESULT_XML += "</Events>" ;
                         // console.log(RESULT_XML);
                         
                         fs.writeFile("tff_birincilig_2012-2013.xml", RESULT_XML, function(err) {
                                      if(err) {
                                      console.log(err);
                                      } else {
                                      console.log("The file was saved!");
                                      }
                                      });
                         
                         
                         res.end('Done');
                         
                         });
        
        
        }); // end of app.get('/tffbirincilig...

function getDayMatchesForBirinciLig(day, callback){
    
    console.log('day is : ' + day);
    
    
    async.waterfall([
                     
                     function(callback1){
                     
                     var targeturl = 'http://www.tff.org/Default.aspx?pageID=142&hafta='+ day +'#macctl00_MPane_m_142_6656_ctnr_m_142_6656';
                     
                     
                     request({uri: targeturl, timeout : 60000, method : "GET"  }, function(err, response, body){
                             
                             if(err) {console.log(" error for DayMatches requests : " + err);}
                             
                             if(response && response.statusCode !== 200){console.log('Request error.');}
                             
                             callback1(null,body);
                             
                             });
                     
                     },
                     
                     function(body, callback2) {
                     
                     console.log('Games will be looked for...');
                     
                     jsdom.env({
                               html: body,
                               scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                               }, function(err, window){
                               //Use jQuery just as in a regular HTML page
                               
                               
                               if(err) console.log(" error for jsdom : " + err);
                               
                               var $ = window.$,
                               $gametable  = $("#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari"),
                               $matches    = $gametable.find('div');
                               
                               
                               var games = new Array();
                               
                               $matches.each(
                                             function(i,item){
                                             var game;
                                             
                                             var   $hometeamspanID  = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_A2",
                                             $awayteamspanID  = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_A5",
                                             $matchspanID     = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_A3",
                                             $datespanID      = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblTarih",
                                             $timespanID      = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                             
                                             var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                             $awayteamspanElm   = $(item).find($awayteamspanID),
                                             $matchspanElm      = $(item).find($matchspanID),
                                             $datespanElm       = $(item).find($datespanID),
                                             $timespanElm       = $(item).find($timespanID);
                                             
                                             var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                             awayteam_linktext   = $awayteamspanElm.attr('href'),
                                             match_linktext      = $matchspanElm.attr('href');
                                             
                                             game =  {
                                             
                                             gameday       : day,
                                             hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                             awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                             matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                             date          : $datespanElm.text(),
                                             time          : $timespanElm.text(),
                                             placeID       : ""
                                             
                                             };
                                             
                                             games.push(game);
                                             
                                             // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;
                                             
                                             //console.log(matchID);
                                             });
                               
                               
                               
                               console.log("Games found!");
                               console.log(games);
                               callback2(null,games);
                               
                               
                               });
                     
                     },
                     
                     function(games,callback3){
                     
                     
                     console.log('Game Places will be looked for...');
                     
                     async.eachSeries(games,getGamePlace,function(err){
                                      
                                      console.log('Games Places retrieved!');
                                      
                                      callback3(null);
                                      
                                      });
                     
                     }
                     
                     ],
                    
                    function(err){
                    
                    console.log("all games for day #" + day + " found!");
                    
                    callback(); //callback for getDayMatches
                    
                    });
}



app.get('/tff', function(req, res){
   
        //Tell the request that we want to fetch youtube.com, send the results to a callback function

        var weeknumber = 1;
        var self = this;

        
        async.whilst(
                     
                     
        function () { return weeknumber <= 34; },

                     
                     
        function(callbackForWeek) {
                     
                     console.log('week # '+weeknumber );
                     
                     var targeturl = 'http://www.tff.org/Default.aspx?pageID=198&hafta='+ weeknumber +'#macctl00_MPane_m_198_935_ctnr_m_198_935';
                     
                     self.items = new Array(); //I feel like I want to save my results in an array

                     
                     async.waterfall([
                                      
                                      function(callback1){
                                      
                                      
                                      request({uri: targeturl, timeout : 60000, method : "GET"  }, function(err, response, body){
                                              //      var self = this;
                                              
                                              //Just a basic error check
                                              console.log("request made # " + weeknumber );
                                              
                                              console.log(" error for weekly requests : " + err + " response for weekly requests : " + response);
                                              
                                              if(err && response.statusCode !== 200){console.log('Request error.');}
                                              
                                              callback1(null,body);
                                              
                                              });
                                      
                                      },
                                      
                                      function(body, callback2){
                                      
                                      jsdom.env({
                                                html: body,
                                                scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                                                }, function(err, window){
                                                //Use jQuery just as in a regular HTML page
                                                
                                                
                                                if(err) console.log(" error for jsdom : " + err);
                                                
                                                var $ = window.$,
                                                $gametable  = $("#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari"),
                                                $matches    = $gametable.find('div');
                                                
                                                
                                                console.log('matches for week #' + weeknumber + ' retrieved');

                                                
                                                $matches.each(
                                                              function(i,item){
                                                              
                                                              var   $hometeamspanID  = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_A2",
                                                              $awayteamspanID  = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_A5",
                                                              $matchspanID     = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_A3",
                                                              $datespanID      = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblTarih",
                                                              $timespanID      = "#ctl00_MPane_m_198_935_ctnr_m_198_935_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                                              
                                                              var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                                              $awayteamspanElm   = $(item).find($awayteamspanID),
                                                              $matchspanElm      = $(item).find($matchspanID),
                                                              $datespanElm       = $(item).find($datespanID),
                                                              $timespanElm       = $(item).find($timespanID);
                                                              
                                                              var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                                              awayteam_linktext   = $awayteamspanElm.attr('href'),
                                                              match_linktext      = $matchspanElm.attr('href');
                                                              
                                                              
                                                              var matchID = match_linktext.substring(match_linktext.lastIndexOf("=")+1);
                                                              
                                                              
                                                              async.waterfall([
                                                                               
                                                                               function(callback3){
                                                                               
                                                                               request({uri: 'http://www.tff.org/Default.aspx?pageId=29&macId=' + matchID, timeout : 60000, method : "GET"}, function(err, response, body){
                                                                                       
                                                                                       console.log(" error for match "+i+ " : " +err+ " response for weekly requests : " + response);
                                                                                       
                                                                                       //Just a basic error check
                                                                                       if(err && response.statusCode !== 200){console.log('Request error.');}
                                                                                       
                                                                                       callback3(null,body);
                                                                                       });
                                                                               
                                                                               },
                                                                               
                                                                               function(body, callback4){
                                                                               
                                                                               jsdom.env({
                                                                                         
                                                                                         html: body,
                                                                                         scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                                                                                         
                                                                                         }, function(err, window){
                                                                                         
                                                                                         var $matchplaceElm      = window.$("#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_lnkStad"),
                                                                                         
                                                                                         matchplace_linktext     = $matchplaceElm.attr('href');
                                                                                         
                                                                                         callback4(null,matchplace_linktext.substring(matchplace_linktext.lastIndexOf("=")+1));
                                                                                         
                                                                                         });
                                                                               
                                                                               
                                                                               }
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               ],
                                                                              
                                                                              function(err,matchplaceID){
                                                                              
                                                                              self.items[i] = {
                                                                              
                                                                              hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                                                              awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                                                              matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                                                              dateID        : $datespanElm.text(),
                                                                              timeID        : $timespanElm.text(),
                                                                              placeID       : matchplaceID
                                                                              
                                                                              }
                                                                              
                                                                              console.log('------ Week #'+ weeknumber + ' Game #' + i + '------------');
                                                                              console.log(self.items[i]);
                                                                              console.log('===================================================');
                                                                              
                                                                              
                                                                              callback2(null); // call back of second function 
                                                                              
                                                                              }
                                                                              
                                                                              
                                                                              );//end of async.waterfall
                                                              
                                                              }); // end of matches
                                                
                                                
                                                }); //end of jsdom
                                      
                                      
                                      } // end of second function of waterfall
                                      
                                      ]
                                     
                                     ,
                                     
                                     // callback for async.waterfall
                                     function(err){
                                     
                                     console.log("fixture for week #" +weeknumber+" parsed");
                                     
                                     weeknumber++;
                                     callbackForWeek();
                                     
                                     
                                     }
                                     
                                     
                                     ); // end of async.waterfall
                     
                     },
                     
                     
                     
        function(err) {
    
                     // write to file
                     
                     
                   
                     
                     
                     }
                     
        ); // end of async.whilst
        
        // console.log('week : ' + weeknumber);
        
          res.end('Done');
        
}); // end of app.get('tff')
        
        


app.get('/sportevents', sportevents.findAllSportEvents);
app.get('/sportevents/:id', sportevents.findById);
//app.post('/sportevents', sportevents.addSportEvent);
app.post('/sportevents/all', sportevents.populateSportEvents);
app.put('/sportevents/:id', sportevents.updateSportEvent);
app.delete('/sportevents/:id', sportevents.deleteSportEvent);

/*

function parseTFFplaceID(matchID, matchplaceID) {

    
    request({uri: 'http://www.tff.org/Default.aspx?pageId=29&macId=' + matchID}, function(err, response, body){
            
            var self = this;

            //Just a basic error check
            if(err && response.statusCode !== 200){console.log('Request error.');}
            
            //Send the body param as the HTML code we will parse in jsdom
            //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
            jsdom.env({
                      html: body,
                      scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                      }, function(err, window){

                      var $matchplaceElm      = window.$("#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_lnkStad"),
                      matchplace_linktext     = $matchplaceElm.attr('href');
                      
                      matchplaceID            = matchplace_linktext.substring(matchplace_linktext.lastIndexOf("=")+1),
                      console.log(matchID  + " match played in " + matchplaceID);

                      
                      });
            
            
            
            
            
            });
    
    
    
}

*/

/*
    var self = this;
    
    jsdom.env('http://www.tff.org/Default.aspx?pageId=29&macId=' + match_linktext.substring(match_linktext.lastIndexOf("=")+1), [
                                                                                                                                 'http://code.jquery.com/jquery-1.6.min.js'
                                                                                                                                 ], function(errors, window) {
              
              var $matchplaceElm      = window.$("#ctl00_MPane_m_29_194_ctnr_m_29_194_MacBilgiDisplay1_dtMacBilgisi_lnkStad"),
              matchplace_linktext     = $matchplaceElm.attr('href');
              
              matchplaceID            = matchplace_linktext.substring(matchplace_linktext.lastIndexOf("=")+1),
              console.log(matchplaceID);
              });
    
    
    

}

*/


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
