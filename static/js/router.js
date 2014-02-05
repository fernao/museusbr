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
	    '' : 'index',
	},
	
	index: function() {
	    var indexView = new IndexView();
	    indexView.render();
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