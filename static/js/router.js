define([
    'jquery', 
    'backbone',
], function($, Backbone){
    var App = {};
    
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    '' : 'index',
	},	    

	index: function() {
	    console.log('oi');
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