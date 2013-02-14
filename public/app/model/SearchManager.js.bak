
window.SearchManager = {

    apiUrl:"http://127.0.0.1:3000/restaurants-api?",
    
    search:function (searchString, successCallback, errorCallback) {
        var searchURL = this.apiUrl + "q=" + encodeURIComponent(searchString) + "&ll=" + /*window.GeoWatcher.position.latitude*/ "32.66962" + "," + /*window.GeoWatcher.position.longitude*/ "-117.094619" + "&d=" + new Date().getTime();

        $.ajax({
            timeout:30000,
            url:searchURL,
            dataType: "text",
            success:function(result){
            		console.log("Client Success2 " + result);
                if ( successCallback ) {
                	  console.log("Calling Success Callback");
                    successCallback( result );
                }
            },
            /*error:function(error){
            	  console.log("Client Error2 " + error);
                if ( errorCallback ){
                	  console.log("Calling Error Callback " + result.status + ' ' + result.statusText);
                    errorCallback( error );
                }
            }*/
            
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
            if (poi.factual_id == id){
                return poi;
            }
        }
        return null;
    }
}
