templates.tweetView = "app/views/TweetView.html";

window.TweetView = Backbone.View.extend({

   template:undefined,
    
    title:"",
    
    initialize: function(options) {
    
        this.template = _.template( templates.tweetView ),
        this.view = this.$el;
	var self = this;


            this.onSearchResult = function(result){
                self.searchResult(result);
            }
            this.onSearchError = function(error){
                self.searchError(error);
            }


	setTimeout(function(){SearchManager.tweetSearch( options.model.hometeamId.name,options.model.awayteamId.name, options.model.placeId.name, self.onSearchResult, self.onSearchError );}, 801 );

        this.render();
    },  


     render:function (eventName) {
        var model = this.model;
        this.$el.html( this.template( model ));
        this.$el.css("background", "black");
	return this;
     },



     searchResult: function(result) {
        //console.log(result);
        try {
	    var jsonResult = JSON.parse(result);
var view = new TweetResultsView({ model:jsonResult});
	    
/*
            var view = new TweetResultsView({ model:jsonResult});
		window.viewNavigator2 = new ViewNavigator( "#tweetview" );	
    		window.viewNavigator2.pushView( view );
*/

view.setElement(this.$('.tweetresult')).render();

        }
        catch(e){
            alert(e.toString())
        }
    },

    searchError: function(error) {
       // console.log(error);
        var self = this;
	    alert("ERROR");
    }

}
);


