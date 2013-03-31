templates.tweetView = "app/views/TweetView.html";

window.TweetView = Backbone.View.extend({

   template:undefined,
    
    title:"",
     tagName: 'div',
    id: 'tweet',
    
    initialize: function(options) {
    
        this.template = _.template( templates.tweetView ),
        this.view = this.$el;
	var self = this;


        this.onSearchResult = function(result){
         self.searchResult(result);
        };

        this.onSearchError = function(error){
          self.searchError(error);
        };

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
        try {
	    var jsonResult = JSON.parse(result);
	    var view = new TweetResultsView({ model:jsonResult});
	    view.setElement($('.tab-content')).render();
        }
        catch(e){
            alert(e.toString())
        }
    },

    searchError: function(error) {
        var self = this;
	    alert("ERROR");
    }
}
);



