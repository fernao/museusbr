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
	    ':lang/:tags' : 'index',
	    ':lang' : 'index',
	},
	
	index: function(lang, tags) {
	    var tags = tags || '',
	    lang = lang || 'pt-br';
	    
	    var indexView = new IndexView();
	    indexView.render(lang, tags);
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