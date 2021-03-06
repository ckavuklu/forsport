templates.tweetListItemView = "app/views/TweetListItemView.html";

window.TweetListItemView = Backbone.View.extend({

    //tagName:'li',
    template:undefined,
    
    initialize: function(options) {
    
        this.template = _.template( templates.tweetListItemView ),
        this.render();

	//twttr.widgets.load();
        this.view = this.$el;
	this.model = options.model;
    },  
    
    render:function (eventName) {
        var model = this.model;
        this.$el.html( this.template( model ));
	//twttr.widgets.load();
        return this;
    }
  
});
