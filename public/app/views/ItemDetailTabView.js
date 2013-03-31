templates.itemDetailTabView = "app/views/ItemDetailTabView.html";
window.ItemDetailTabView = Backbone.View.extend({

    template:undefined,
    backLabel: "Back",
    title:"",
    tagName: 'div',
    
    initialize: function(options) {
        this.template = _.template( templates.itemDetailTabView ),
        this.view = this.$el;
        var model = this.model;
        this.render();

  	  var detailView = new ItemDetailView({model:model});
	  detailView.setElement(this.$('.tab-content')).render();
    },  

        
    events:{
        "click li":"tabItemClick"
    },

   
    render:function (eventName) {
        var model = this.model;
        this.$el.html( this.template( model ));
        this.$el.css("background", "white");

        return this;
    },

     tabItemClick: function( event ) {
        var model = this.model;
	this.$el.find( "li" ).removeClass( "active" );

        var target = $( event.target )
        while (target.get(0).nodeName.toUpperCase() != "LI") {
            target=target.parent();
        }

	target.addClass( "active" );

        var id = target.attr( "id" );

	if(id == "tweetTab"){
  	  var tweetView = new TweetView({model:model});
	  tweetView.setElement(this.$('.tab-content')).render();
	
	}else if(id == "mapTab"){
  	  var detailView = new ItemDetailView({model:model});
	  detailView.setElement(this.$('.tab-content')).render();
	}
       
    }
   
});
