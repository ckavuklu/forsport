
window.SearchManager = {

    apiUrl:"http://127.0.0.1:3000/sportevents?",
    
    search:function (searchString, successCallback, errorCallback) {
        var searchURL = this.apiUrl + "q=" + encodeURIComponent(searchString) + "&ll=" + window.GeoWatcher.position.latitude + "," + window.GeoWatcher.position.longitude + "&d=" + new Date().getTime();


        $.ajax({
            timeout:30000,
            url:searchURL,
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
    }
}
