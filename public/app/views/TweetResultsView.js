templates.tweetResults = "app/views/TweetResultsView.html";

window.TweetResultsView = Backbone.View.extend({

    title: "",
    
    initialize: function(options) {
        console.log('initialize');

        this.model = options.model;

        this.render();
        this.view = this.$el;
    },  
    
    events:{
    },
    
    render:function (eventName) {
        var template = _.template(templates.tweetResults);
        this.$el.css("background", "white");
        this.$el.html(template( {results:this.model.tweets.results} ));
        var $list = this.$el.find("#tweetlist");

        var self = this;
        var index = 1;
        _.each(this.model.tweets.results, function (tweet) {
            $list.append(new TweetListItemView({model:tweet}).render().el);
            index += 1;
        }, this);
        
        return this;
    }
   
});
