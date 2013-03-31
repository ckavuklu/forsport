var jsdom = require("jsdom"),
async = require("async"),
fs = require("fs"),
express = require('express'),
request = require('request');

var STATUS = "SLEEPING";

var app = express();


app.get('/tffstatus',function(req,res){
        
        res.send(STATUS);
        
        });


app.get('/tff', function(req, res){
        
        STATUS = "WORKING <br/>";
        
        var startWeek = req.query["start"];
        var endWeek = req.query["end"];
        
        if (startWeek==null) startWeek=1;
        if (endWeek==null) endWeek=34;
        
        console.log("start : " + startWeek + " end : " + endWeek);
        
        var days = new Array();
        
        for(var i=startWeek;i<=endWeek;i++){
        days.push(i);
        }
        

        fs.exists("events.xml",function(exists){
                  if(exists) { console.log('file is there'); fs.unlink("events.xml"); }
                 else console.log('file not there');
                 
        
        });
        
        /* write first lline */
         
        fs.writeFile("events.xml","<?xml version=\"1.0\" encoding=\"ISO-8859-9\"?> <Events>",function(err) {
                if(err) {
                        console.log(err);
                        } else {
                                console.log("The file is created!");
                                }
                     });

        
        
        
        async.waterfall([
                        
                        
                         function(callback1){

                                          
                            async.eachSeries(days,getDayMatchesForSuperLig,function(err){
                                          
                                          console.log('end of super lig operation');
                                          STATUS += "Completed SUPERLIG<br/>";
                                             
                                          callback1(null);
                                          });
                         },
                        
                         
                        function(callback2){
                         
                            async.eachSeries(days,getDayMatchesForBirinciLig,function(err){
                                                           
                                            console.log('end of birinci lig operation');
                                            STATUS += "Completed BIRINCILIG<br/>";
                                            callback2(null);
                                            });
                        
                         },
                         
                         function(callback3){
                         
                         async.eachSeries(days,getDayMatchesForIkinciLigBeyaz,function(err){
                                          
                                          console.log('end of ikinci lig beyaz operation');
                                          STATUS += "Completed IKINCILIG BEYAZ<br/>";
                                          callback3(null);
                                          });
                         
                         },
                         
                         function(callback4){
                         
                         async.eachSeries(days,getDayMatchesForIkinciLigKirmizi,function(err){
                                          
                                          console.log('end of ikinci lig kirmizi  operation');
                                          STATUS += "Completed IKINCILIG KIRMIZI<br/>";
                                          callback4(null);
                                          });
                         
                         },
                         
                         function(callback5){
                         
                         async.eachSeries(days,getDayMatchesForUcuncuLig01,function(err){
                                          
                                          console.log('end of ucuncu lig 01 operation');
                                          STATUS += "Completed UCUNCULIG 01<br/>";
                                          callback5(null);
                                          });
                         
                         },
                         function(callback6){
                         
                         async.eachSeries(days,getDayMatchesForUcuncuLig02,function(err){
                                          
                                          console.log('end of ucuncu lig 02  operation');
                                          STATUS += "Completed UCUNCULIG 02<br/>";
                                          callback6(null);
                                          });
                         
                         },
                         function(callback7){
                         
                         async.eachSeries(days,getDayMatchesForUcuncuLig03,function(err){
                                          
                                          console.log('end of ucuncu lig 03  operation');
                                          STATUS += "Completed UCUNCULIG 03<br/>";
                                          callback7(null);
                                          });
                         
                         }],
                        
                        function(err){
                        
                        fs.appendFile("events.xml","</Events>",function(err) {
                                     if(err) {
                                      console.log(err);
                                      throw err;
                                     } else {
                                            console.log("The file is saved!");
                                     }
                                     
                                      
                                     STATUS = "Completed all successfully";
                                     res.end(STATUS);

                                     
                                     });
                        
                        });
        
          
        }); // end of app.get('/tff...

function getDayMatchesForSuperLig(day, callback){

    console.log('Super Lig Day is : ' + day);


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
                      
  //                    console.log('Games will be looked for...');
                     
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
                                                         orgID         : "1",
                                                         gameday       : day,
                                                         hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                                         awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                                         matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                                         date          : $datespanElm.text().trim(),
                                                         time          : $timespanElm.text().trim(),
                                                         placeID       : ""
                                                     
                                                     };
                                                     
                                                     games.push(game);
                                                     
                                                     // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;

                                                     //console.log(matchID);
                                                     });
                                       
                                       
                                       
    //                                   console.log("Games found!");
      //                                 console.log(games);
                                       callback2(null,games);
                                       
                                       
                                       });
                     
                        },
                     
                     function(games,callback3){
                     
                      
        //              console.log('Game Places will be looked for...');
                      
                      async.eachSeries(games,getGamePlace,function(err){
                                        
          //                              console.log('Games Places retrieved!');
                                        
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

    // console.log("Place looked for game : " + game.matchID);
    
    
    
    async.waterfall([
                     
                      function(callback4){
                      
                            request({uri: 'http://www.tff.org/Default.aspx?pageId=29&macId=' + game.matchID, timeout : 60000, method : "GET"}, function(err, response, body){
                                  
                                if(err) {console.log(" error for place retrieval : " + err);}
                                   
                                if(response && response.statusCode !== 200){ console.log('Request error.');}
                                
       //                         console.log("Body found!");
                                         
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
                    
                        if (game.placeID == '5345') game.placeID = '89';
                        else if (game.placeID == '3811') game.placeID = '175';
                        else if (game.placeID == '476') game.placeID = '138';
                        else if (game.placeID == '3763') game.placeID = '78';
                        else if (game.placeID == '133') game.placeID = '473';
                        else if (game.placeID == '5474') game.placeID = '128';
                    
                    
                    
                    
                        // game.date = $.trim(game.date);
                    
                    
                     //   console.log('Place found for game : ' + game.matchID + ' is : ' + game.placeID);
                    
                    
                    
                        var event = "<Event eventtypeID=\"1\" orgID=\"" + game.orgID +"\" week=\""+game.gameday+"\" matchID=\""+ game.matchID+"\" hometeamID=\""+game.hometeamID+"\" awayteamID=\""+game.awayteamID+"\" placeID=\""+game.placeID+"\" eventdate=\""+game.date+"\" eventtime=\""+game.time+"\"/>" ;
                   
                    
                    fs.appendFile("events.xml",event,function(err) {
                                  if(err) {
                                  console.log(err);
                                  throw err;
                                  } else {
         //                         console.log("event added!");
                                  }
                                  });
                                  
                    
                    
                         
                        callback();
                     
                     });
     
    
    
  //callback();
    
}

function getDayMatchesForBirinciLig(day, callback){
    
    console.log('Birinci Lig day is : ' + day);
    
    
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
                     
                     //console.log('Games will be looked for...');
                     
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
                                             orgID         : "2",
                                             gameday       : day,
                                             hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                             awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                             matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                             date          : $datespanElm.text().trim(),
                                             time          : $timespanElm.text().trim(),
                                             placeID       : ""
                                             
                                             };
                                             
                                             games.push(game);
                                             
                                             // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;
                                             
                                             //console.log(matchID);
                                             });
                               
                               
                               
                               //console.log("Games found!");
                               //console.log(games);
                               callback2(null,games);
                               
                               
                               });
                     
                     },
                     
                     function(games,callback3){
                     
                     
                     //console.log('Game Places will be looked for...');
                     
                     async.eachSeries(games,getGamePlace,function(err){
                                      
                                      //console.log('Games Places retrieved!');
                                      
                                      callback3(null);
                                      
                                      });
                     
                     }
                     
                     ],
                    
                    function(err){
                    
                    console.log("all games for day #" + day + " found!");
                    
                    callback(); //callback for getDayMatches
                    
                    });
}

function getDayMatchesForIkinciLigBeyaz(day, callback){
    
    console.log('Ikinci Lig Beyaz day is : ' + day);
    
    
    async.waterfall([
                     
                     function(callback1){
                     
                     var targeturl = 'http://www.tff.org/Default.aspx?pageID=976&grupID=907&hafta='+ day +'#macctl00_MPane_m_976_6233_ctnr_m_976_6233';
                     
                     request({uri: targeturl, timeout : 60000, method : "GET" }, function(err, response, body){
                             
                             if(err) {console.log(" error for DayMatches requests : " + err);}
                             
                             if(response && response.statusCode !== 200){console.log('Request error.');}
                             
                             // body = iconv.decode(body,'iso-8859-1');
                             
                             // console.log(body);

                             callback1(null,body);
                             
                             
                             
                             });
                     
                     },
                     
                     function(body, callback2) {
                     
                     //console.log('Games will be looked for... ');
                  
                     var months = [ "Ocak", "�ubat", "Mart" , "Nisan", "May�s" , "Haziran",  "Temmuz" , "A�ustos" , "Eyl�l" , "Ekim" , "Kas�m" , "Aral�k" ];
                     
                     jsdom.env({
                               html: body,
                               scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                               }, function(err, window){
                               //Use jQuery just as in a regular HTML page
                               
                               
                               
                               if(err) console.log(" error for jsdom : " + err);
                               
                               
                               var $ = window.$,
                               
                               $gametable  = $("#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari"),
                               
                               $matches    = $gametable.find('tr[align="center"]');
                               
                               var games = new Array();
                               
                               $matches.each(
                                             function(i,item){
                                             var game;
                                             
                                             var   $hometeamspanID  = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblTakim1",
                                             $awayteamspanID  = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblTakim2",
                                             $matchspanID     = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblSkor",
                                             $datespanID      = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblTarih";
                                             // $timespanID      = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                             
                                             var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                             $awayteamspanElm   = $(item).find($awayteamspanID),
                                             $matchspanElm      = $(item).find($matchspanID),
                                             $datespanElm       = $(item).find($datespanID);
                                             // $timespanElm       = $(item).find($timespanID);
                                             
                                             var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                             awayteam_linktext   = $awayteamspanElm.attr('href'),
                                             match_linktext      = $matchspanElm.attr('href');
                                             
                                             var timeparsed = $datespanElm.text().substring($datespanElm.text().length-5).trim(),
                                             dateparsed = $datespanElm.text().substring(0,$datespanElm.text().length-6).trim();
                                             
                                             var monthlength = dateparsed.lastIndexOf(" ")-dateparsed.indexOf(" ")-1 ;
                                             
                                             //console.log("Date parsed : " + dateparsed +"# indexOf : " + dateparsed.indexOf(" ") + " last index : " + dateparsed.lastIndexOf(" ") + " length : " + monthlength);
                                             
                                             // PARSE Date
                                             var daystr = dateparsed.substring(0,dateparsed.indexOf(" "));
                                             var month = dateparsed.substring(dateparsed.indexOf(" ")+1,dateparsed.lastIndexOf(" "));
                                             var year = dateparsed.substring(dateparsed.lastIndexOf(" ")+1);

                                             if (daystr.length == 1) daystr = "0"+daystr;
                                             
                                             var monthindex = months.indexOf(month)+1;
                                             var monthstr = monthindex + "";
                                             if (monthindex < 10) monthstr = "0" + monthindex;
                                             
                                             dateparsed = daystr + "." + monthstr + "." + year;

                                             
                                             
                                             game =  {
                                             
                                             orgID         : "3",
                                             gameday       : day,
                                             hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                             awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                             matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                             date          : dateparsed,
                                             time          : timeparsed,
                                             placeID       : ""
                                             
                                             };
                                             
                                             games.push(game);
                                             
                                             // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;
                                             
                                             //console.log(matchID);
                                             });
                               
                               
                               
                               //console.log("Games found!");
                               //console.log(games);
                               callback2(null,games);
                               
                               
                               });
                     
                     },
                     
                     function(games,callback3){
                     
                     
                     //console.log('Game Places will be looked for...');
                     
                     async.eachSeries(games,getGamePlace,function(err){
                                      
                                      //console.log('Games Places retrieved!');
                                      
                                      callback3(null);
                                      
                                      });
                     
                     }
                     
                     ],
                    
                    function(err){
                    
                    console.log("all games for day #" + day + " found!");
                    
                    callback(); //callback for getDayMatches
                    
                    });
}

function getDayMatchesForIkinciLigKirmizi(day, callback){
    
    console.log('For Ikinci Lig Kirmizi day is : ' + day);
    
    
    async.waterfall([
                     
                     function(callback1){
                     
                     var targeturl = 'http://www.tff.org/Default.aspx?pageID=976&grupID=906&hafta='+ day +'#macctl00_MPane_m_976_6233_ctnr_m_976_6233';
                     
                     
                     request({uri: targeturl, timeout : 60000, method : "GET" }, function(err, response, body){
                             
                             if(err) {console.log(" error for DayMatches requests : " + err);}
                             
                             if(response && response.statusCode !== 200){console.log('Request error.');}
                             
                             // body = iconv.decode(body,'iso-8859-1');
                             
                             // console.log(body);
                             
                             callback1(null,body);
                             
                             
                             
                             });
                     
                     },
                     
                     function(body, callback2) {
                     
                     //console.log('Games will be looked for... ');
                     
                     var months = [ "Ocak", "�ubat", "Mart" , "Nisan", "May�s" , "Haziran",  "Temmuz" , "A�ustos" , "Eyl�l" , "Ekim" , "Kas�m" , "Aral�k" ];
                     
                     jsdom.env({
                               html: body,
                               scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                               }, function(err, window){
                               //Use jQuery just as in a regular HTML page
                               
                               
                               
                               if(err) console.log(" error for jsdom : " + err);
                               
                               
                               var $ = window.$,
                               
                               $gametable  = $("#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari"),
                               
                               $matches    = $gametable.find('tr[align="center"]');
                               
                               var games = new Array();
                               
                               $matches.each(
                                             function(i,item){
                                             var game;
                                             
                                             var   $hometeamspanID  = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblTakim1",
                                             $awayteamspanID  = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblTakim2",
                                             $matchspanID     = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblSkor",
                                             $datespanID      = "#ctl00_MPane_m_976_6233_ctnr_m_976_6233_kupaMaclari_ctl0" + (i+1) + "_lblTarih";
                                             // $timespanID      = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                             
                                             var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                             $awayteamspanElm   = $(item).find($awayteamspanID),
                                             $matchspanElm      = $(item).find($matchspanID),
                                             $datespanElm       = $(item).find($datespanID);
                                             // $timespanElm       = $(item).find($timespanID);
                                             
                                             var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                             awayteam_linktext   = $awayteamspanElm.attr('href'),
                                             match_linktext      = $matchspanElm.attr('href');
                                             
                                             var timeparsed = $datespanElm.text().substring($datespanElm.text().length-5).trim(),
                                             dateparsed = $datespanElm.text().substring(0,$datespanElm.text().length-6).trim();
                                             
                                             var monthlength = dateparsed.lastIndexOf(" ")-dateparsed.indexOf(" ")-1 ;
                                             
                                             //console.log("Date parsed : " + dateparsed +"# indexOf : " + dateparsed.indexOf(" ") + " last index : " + dateparsed.lastIndexOf(" ") + " length : " + monthlength);
                                             
                                             // PARSE Date
                                             var daystr = dateparsed.substring(0,dateparsed.indexOf(" "));
                                             var month = dateparsed.substring(dateparsed.indexOf(" ")+1,dateparsed.lastIndexOf(" "));
                                             var year = dateparsed.substring(dateparsed.lastIndexOf(" ")+1);
                                             
                                             if (daystr.length == 1) daystr = "0"+daystr;
                                             
                                             var monthindex = months.indexOf(month)+1;
                                             var monthstr = monthindex + "";
                                             if (monthindex < 10) monthstr = "0" + monthindex;
                                             
                                             dateparsed = daystr + "." + monthstr + "." + year;
                                             
                                             
                                             
                                             game =  {
                                             
                                             orgID         : "4",
                                             gameday       : day,
                                             hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                             awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                             matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                             date          : dateparsed,
                                             time          : timeparsed,
                                             placeID       : ""
                                             
                                             };
                                             
                                             games.push(game);
                                             
                                             // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;
                                             
                                             //console.log(matchID);
                                             });
                               
                               
                               
                               //console.log("Games found!");
                               //console.log(games);
                               callback2(null,games);
                               
                               
                               });
                     
                     },
                     
                     function(games,callback3){
                     
                     
                     //console.log('Game Places will be looked for...');
                     
                     async.eachSeries(games,getGamePlace,function(err){
                                      
                                      //console.log('Games Places retrieved!');
                                      
                                      callback3(null);
                                      
                                      });
                     
                     }
                     
                     ],
                    
                    function(err){
                    
                    console.log("all games for day #" + day + " found!");
                    
                    callback(); //callback for getDayMatches
                    
                    });
}

function getDayMatchesForUcuncuLig01(day, callback){
    
    console.log('UcuncuLig01 day is : ' + day);
    
    
    async.waterfall([
                     
                     function(callback1){
                     
                     var targeturl = 'http://www.tff.org/Default.aspx?pageID=971&grupID=908&hafta='+ day +'#macctl00_MPane_m_971_6238_ctnr_m_971_6238';
                     
                     
                     request({uri: targeturl, timeout : 60000, method : "GET" }, function(err, response, body){
                             
                             if(err) {console.log(" error for DayMatches requests : " + err);}
                             
                             if(response && response.statusCode !== 200){console.log('Request error.');}
                             
                             // body = iconv.decode(body,'iso-8859-1');
                             
                             // console.log(body);
                             
                             callback1(null,body);
                             
                             
                             
                             });
                     
                     },
                     
                     function(body, callback2) {
                     
                     //console.log('Games will be looked for... ');
                     
                     var months = [ "Ocak", "�ubat", "Mart" , "Nisan", "May�s" , "Haziran",  "Temmuz" , "A�ustos" , "Eyl�l" , "Ekim" , "Kas�m" , "Aral�k" ];
                     
                     jsdom.env({
                               html: body,
                               scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                               }, function(err, window){
                               //Use jQuery just as in a regular HTML page
                               
                               
                               
                               if(err) console.log(" error for jsdom : " + err);
                               
                               
                               var $ = window.$,
                               
                               $gametable  = $("#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari"),
                               
                               $matches    = $gametable.find('tr[align="center"]');
                               
                               var games = new Array();
                               
                               $matches.each(
                                             function(i,item){
                                             var game;
                                             
                                             var   $hometeamspanID  = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTakim1",
                                             $awayteamspanID  = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTakim2",
                                             $matchspanID     = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblSkor",
                                             $datespanID      = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTarih";
                                             // $timespanID      = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                             
                                             var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                             $awayteamspanElm   = $(item).find($awayteamspanID),
                                             $matchspanElm      = $(item).find($matchspanID),
                                             $datespanElm       = $(item).find($datespanID);
                                             // $timespanElm       = $(item).find($timespanID);
                                             
                                             var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                             awayteam_linktext   = $awayteamspanElm.attr('href'),
                                             match_linktext      = $matchspanElm.attr('href');
                                             
                                             var timeparsed = $datespanElm.text().substring($datespanElm.text().length-5).trim(),
                                             dateparsed = $datespanElm.text().substring(0,$datespanElm.text().length-6).trim();
                                             
                                             var monthlength = dateparsed.lastIndexOf(" ")-dateparsed.indexOf(" ")-1 ;
                                             
                                             //console.log("Date parsed : " + dateparsed +"# indexOf : " + dateparsed.indexOf(" ") + " last index : " + dateparsed.lastIndexOf(" ") + " length : " + monthlength);
                                             
                                             // PARSE Date
                                             var daystr = dateparsed.substring(0,dateparsed.indexOf(" "));
                                             var month = dateparsed.substring(dateparsed.indexOf(" ")+1,dateparsed.lastIndexOf(" "));
                                             var year = dateparsed.substring(dateparsed.lastIndexOf(" ")+1);
                                             
                                             if (daystr.length == 1) daystr = "0"+daystr;
                                             
                                             var monthindex = months.indexOf(month)+1;
                                             var monthstr = monthindex + "";
                                             if (monthindex < 10) monthstr = "0" + monthindex;
                                             
                                             dateparsed = daystr + "." + monthstr + "." + year;
                                             
                                             
                                             
                                             game =  {
                                             
                                             orgID         : "5",
                                             gameday       : day,
                                             hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                             awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                             matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                             date          : dateparsed,
                                             time          : timeparsed,
                                             placeID       : ""
                                             
                                             };
                                             
                                             games.push(game);
                                             
                                             // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;
                                             
                                             //console.log(matchID);
                                             });
                               
                               
                               
                               //console.log("Games found!");
                               //console.log(games);
                               callback2(null,games);
                               
                               
                               });
                     
                     },
                     
                     function(games,callback3){
                     
                     
                     //console.log('Game Places will be looked for...');
                     
                     async.eachSeries(games,getGamePlace,function(err){
                                      
                                      //console.log('Games Places retrieved!');
                                      
                                      callback3(null);
                                      
                                      });
                     
                     }
                     
                     ],
                    
                    function(err){
                    
                    console.log("all games for day #" + day + " found!");
                    
                    callback(); //callback for getDayMatches
                    
                    });
}

function getDayMatchesForUcuncuLig02(day, callback){
    
    console.log('Ucuncu Lig 02 day is : ' + day);
    
    
    async.waterfall([
                     
                     function(callback1){
                     
                     var targeturl = 'http://www.tff.org/Default.aspx?pageID=971&grupID=909&hafta='+ day +'#macctl00_MPane_m_971_6238_ctnr_m_971_6238';
                     
                     request({uri: targeturl, timeout : 60000, method : "GET" }, function(err, response, body){
                             
                             if(err) {console.log(" error for DayMatches requests : " + err);}
                             
                             if(response && response.statusCode !== 200){console.log('Request error.');}
                             
                             // body = iconv.decode(body,'iso-8859-1');
                             
                             // console.log(body);
                             
                             callback1(null,body);
                             
                             
                             
                             });
                     
                     },
                     
                     function(body, callback2) {
                     
                     //console.log('Games will be looked for... ');
                     
                     var months = [ "Ocak", "�ubat", "Mart" , "Nisan", "May�s" , "Haziran",  "Temmuz" , "A�ustos" , "Eyl�l" , "Ekim" , "Kas�m" , "Aral�k" ];
                     
                     jsdom.env({
                               html: body,
                               scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                               }, function(err, window){
                               //Use jQuery just as in a regular HTML page
                               
                               
                               
                               if(err) console.log(" error for jsdom : " + err);
                               
                               
                               var $ = window.$,
                               
                               $gametable  = $("#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari"),
                               
                               $matches    = $gametable.find('tr[align="center"]');
                               
                               var games = new Array();
                               
                               $matches.each(
                                             function(i,item){
                                             var game;
                                             
                                             var   $hometeamspanID  = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTakim1",
                                             $awayteamspanID  = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTakim2",
                                             $matchspanID     = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblSkor",
                                             $datespanID      = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTarih";
                                             // $timespanID      = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                             
                                             var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                             $awayteamspanElm   = $(item).find($awayteamspanID),
                                             $matchspanElm      = $(item).find($matchspanID),
                                             $datespanElm       = $(item).find($datespanID);
                                             // $timespanElm       = $(item).find($timespanID);
                                             
                                             var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                             awayteam_linktext   = $awayteamspanElm.attr('href'),
                                             match_linktext      = $matchspanElm.attr('href');
                                             
                                             var timeparsed = $datespanElm.text().substring($datespanElm.text().length-5).trim(),
                                             dateparsed = $datespanElm.text().substring(0,$datespanElm.text().length-6).trim();
                                             
                                             var monthlength = dateparsed.lastIndexOf(" ")-dateparsed.indexOf(" ")-1 ;
                                             
                                             //console.log("Date parsed : " + dateparsed +"# indexOf : " + dateparsed.indexOf(" ") + " last index : " + dateparsed.lastIndexOf(" ") + " length : " + monthlength);
                                             
                                             // PARSE Date
                                             var daystr = dateparsed.substring(0,dateparsed.indexOf(" "));
                                             var month = dateparsed.substring(dateparsed.indexOf(" ")+1,dateparsed.lastIndexOf(" "));
                                             var year = dateparsed.substring(dateparsed.lastIndexOf(" ")+1);
                                             
                                             if (daystr.length == 1) daystr = "0"+daystr;
                                             
                                             var monthindex = months.indexOf(month)+1;
                                             var monthstr = monthindex + "";
                                             if (monthindex < 10) monthstr = "0" + monthindex;
                                             
                                             dateparsed = daystr + "." + monthstr + "." + year;
                                             
                                             
                                             
                                             game =  {
                                             
                                             orgID         : "6",
                                             gameday       : day,
                                             hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                             awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                             matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                             date          : dateparsed,
                                             time          : timeparsed,
                                             placeID       : ""
                                             
                                             };
                                             
                                             games.push(game);
                                             
                                             // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;
                                             
                                             //console.log(matchID);
                                             });
                               
                               
                               
                               //console.log("Games found!");
                               //console.log(games);
                               callback2(null,games);
                               
                               
                               });
                     
                     },
                     
                     function(games,callback3){
                     
                     
                     //console.log('Game Places will be looked for...');
                     
                     async.eachSeries(games,getGamePlace,function(err){
                                      
                                      //console.log('Games Places retrieved!');
                                      
                                      callback3(null);
                                      
                                      });
                     
                     }
                     
                     ],
                    
                    function(err){
                    
                    console.log("all games for day #" + day + " found!");
                    
                    callback(); //callback for getDayMatches
                    
                    });
}

function getDayMatchesForUcuncuLig03(day, callback){
    
    console.log('Ucuncu Lig 03 day is : ' + day);
    
    
    async.waterfall([
                     
                     function(callback1){
                     
                     var targeturl = 'http://www.tff.org/Default.aspx?pageID=971&grupID=910&hafta='+ day +'#macctl00_MPane_m_971_6238_ctnr_m_971_6238';
                     
                     
                     request({uri: targeturl, timeout : 60000, method : "GET" }, function(err, response, body){
                             
                             if(err) {console.log(" error for DayMatches requests : " + err);}
                             
                             if(response && response.statusCode !== 200){console.log('Request error.');}
                             
                             // body = iconv.decode(body,'iso-8859-1');
                             
                             // console.log(body);
                             
                             callback1(null,body);
                             
                             
                             
                             });
                     
                     },
                     
                     function(body, callback2) {
                     
                     //console.log('Games will be looked for... ');
                     
                     var months = [ "Ocak", "�ubat", "Mart" , "Nisan", "May�s" , "Haziran",  "Temmuz" , "A�ustos" , "Eyl�l" , "Ekim" , "Kas�m" , "Aral�k" ];
                     
                     jsdom.env({
                               html: body,
                               scripts: ['http://code.jquery.com/jquery-1.6.min.js']
                               }, function(err, window){
                               //Use jQuery just as in a regular HTML page
                               
                               
                               
                               if(err) console.log(" error for jsdom : " + err);
                               
                               
                               var $ = window.$,
                               
                               $gametable  = $("#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari"),
                               
                               $matches    = $gametable.find('tr[align="center"]');
                               
                               var games = new Array();
                               
                               $matches.each(
                                             function(i,item){
                                             var game;
                                             
                                             var   $hometeamspanID  = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTakim1",
                                             $awayteamspanID  = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTakim2",
                                             $matchspanID     = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblSkor",
                                             $datespanID      = "#ctl00_MPane_m_971_6238_ctnr_m_971_6238_kupaMaclari_ctl0" + (i+1) + "_lblTarih";
                                             // $timespanID      = "#ctl00_MPane_m_142_6656_ctnr_m_142_6656_dtlHaftaninMaclari_ctl0" + (i+1) + "_lblSaat";
                                             
                                             var   $hometeamspanElm   = $(item).find($hometeamspanID),
                                             $awayteamspanElm   = $(item).find($awayteamspanID),
                                             $matchspanElm      = $(item).find($matchspanID),
                                             $datespanElm       = $(item).find($datespanID);
                                             // $timespanElm       = $(item).find($timespanID);
                                             
                                             var   hometeam_linktext   = $hometeamspanElm.attr('href'),
                                             awayteam_linktext   = $awayteamspanElm.attr('href'),
                                             match_linktext      = $matchspanElm.attr('href');
                                             
                                             var timeparsed = $datespanElm.text().substring($datespanElm.text().length-5).trim(),
                                             dateparsed = $datespanElm.text().substring(0,$datespanElm.text().length-6).trim();
                                             
                                             var monthlength = dateparsed.lastIndexOf(" ")-dateparsed.indexOf(" ")-1 ;
                                             
                                             //console.log("Date parsed : " + dateparsed +"# indexOf : " + dateparsed.indexOf(" ") + " last index : " + dateparsed.lastIndexOf(" ") + " length : " + monthlength);
                                             
                                             // PARSE Date
                                             var daystr = dateparsed.substring(0,dateparsed.indexOf(" "));
                                             var month = dateparsed.substring(dateparsed.indexOf(" ")+1,dateparsed.lastIndexOf(" "));
                                             var year = dateparsed.substring(dateparsed.lastIndexOf(" ")+1);
                                             
                                             if (daystr.length == 1) daystr = "0"+daystr;
                                             
                                             var monthindex = months.indexOf(month)+1;
                                             var monthstr = monthindex + "";
                                             if (monthindex < 10) monthstr = "0" + monthindex;
                                             
                                             dateparsed = daystr + "." + monthstr + "." + year;
                                             
                                             
                                             
                                             game =  {
                                             
                                             orgID         : "7",
                                             gameday       : day,
                                             hometeamID    : hometeam_linktext.substring(hometeam_linktext.lastIndexOf("=")+1),
                                             awayteamID    : awayteam_linktext.substring(awayteam_linktext.lastIndexOf("=")+1),
                                             matchID       : match_linktext.substring(match_linktext.lastIndexOf("=")+1),
                                             date          : dateparsed,
                                             time          : timeparsed,
                                             placeID       : ""
                                             
                                             };
                                             
                                             games.push(game);
                                             
                                             // RESULT_XML += ("<Event matchID=\""+matchID+"\"/>") ;
                                             
                                             //console.log(matchID);
                                             });
                               
                               
                               
                               //console.log("Games found!");
                               //console.log(games);
                               callback2(null,games);
                               
                               
                               });
                     
                     },
                     
                     function(games,callback3){
                     
                     
                     //console.log('Game Places will be looked for...');
                     
                     async.eachSeries(games,getGamePlace,function(err){
                                      
                                      //console.log('Games Places retrieved!');
                                      
                                      callback3(null);
                                      
                                      });
                     
                     }
                     
                     ],
                    
                    function(err){
                    
                    console.log("all games for day #" + day + " found!");
                    
                    callback(); //callback for getDayMatches
                    
                    });
}

app.listen(3000);
console.log('Listening on port 3000');
