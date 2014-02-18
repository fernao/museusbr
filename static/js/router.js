define([
    'jquery', 
    'backbone',
    'modules/museu/model',
    'modules/museu/IndexView',
], function($, Backbone, MuseuModel, IndexView){
    var App = {};
    
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    ':tags' : 'index',
	    '' : 'index',
	},
	
	index: function(tags) {
	    tags = tags || '';
	    var indexView = new IndexView();
	    indexView.render(tags);
	},
    });
    
    var initialize = function(){
	new App.Router();
	Backbone.history.start();
    };
    
    return {
	initialize: initialize
    };    
});