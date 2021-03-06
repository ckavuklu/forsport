
window.SearchManager = {

    apiUrl:"http://dry-ravine-7867.herokuapp.com/sportevents",
    //apiUrl:"http://127.0.0.1:3000/sportevents",

    tweetSearch:function (homeTeamTag, awayTeamTag, eventTag, successCallback, errorCallback) {
    	var searchURL = this.apiUrl + "/tweets?hometeamtag=" + encodeURIComponent(homeTeamTag) + "&awayteamtag=" + encodeURIComponent(awayTeamTag) + "&eventtag=" + encodeURIComponent(eventTag);

        $.ajax({
            timeout:30000,
            url:searchURL,
	    type: 'GET',
            dataType: "text",
            success:function(result){
                if ( successCallback ) {
		  var obje = JSON.parse(result);
                  successCallback( JSON.stringify(obje));
                }
            },
            
            error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.\n Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
            	console.log(' status ' + jqXHR.responseText);
                alert('Requested JSON parse failed. ' + jqXHR.status);
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error.\n' + jqXHR.responseText);
            }
        }

        });


    },
    
    search:function (searchString, successCallback, errorCallback) {

    	var lat, lon;

	if(GeoWatcher.isValidLocation()){
		lat = window.GeoWatcher.position.latitude;
		lon = window.GeoWatcher.position.longitude;
	}else{
		lat = "40.870673";
		lon = "29.390681";
	}
        var searchURL = this.apiUrl + "?q=" + encodeURIComponent(searchString) + "&ll=" + lat + "," + lon + "&d=" + new Date().getTime();


        $.ajax({
            timeout:30000,
            url:searchURL,
	    type: 'GET',
            dataType: "text",
            success:function(result){
                if ( successCallback ) {
								  var obje = JSON.parse(result);
								  obje.events =obje.events.filter(function(v) { return v.placeId == null? false: true;});
								  obje.events =obje.events.filter(function(v) { return v.hometeamId == null? false: true;});
								  obje.events =obje.events.filter(function(v) { return v.awayteamId == null? false: true;});
								  obje.events =obje.events.filter(function(v) { return v.eventTypeId == null? false: true;});
                  successCallback( JSON.stringify(obje));
                }
            },
            
            error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.\n Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
            	console.log(' status ' + jqXHR.responseText);
                alert('Requested JSON parse failed. ' + jqXHR.status);
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error.\n' + jqXHR.responseText);
            }
        }

        });

    },

    findPointById:function (id, collection) {
        for (var x=0; x<collection.length; x++) {
            var poi = collection[x];
            if (poi.placeId.placeId == id){
                return poi;
            }
        }
        return null;
    },




    checkin:function (id, successCallback, errorCallback) {
        var searchURL = this.apiUrl + "/" + id;

        $.ajax({
            timeout:30000,
            url:searchURL,
	    type: 'PUT',
            dataType: "text",
            success:function(result){
	window.alert("SUCES:" + result);
                if ( successCallback ) {
	window.alert("SUCES2:" + result);
		  var obje = JSON.parse(result);
                  successCallback( JSON.stringify(obje));
                }
            },
            
            error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                alert('Not connect.\n Verify Network.');
            } else if (jqXHR.status == 404) {
                alert('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                alert('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
            	console.log(' status ' + jqXHR.responseText);
                alert('Requested JSON parse failed. ' + jqXHR.status);
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else {
                alert('Uncaught Error. exception:' + exception + " response: "  + jqXHR.responseText);
            }
        }

        });

    }

}
