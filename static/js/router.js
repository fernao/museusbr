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
	    ':lang/:tags/:localizacao' : 'index',
	    ':lang/:tags' : 'index',
	    ':lang' : 'index',
	    '' : 'index',
	},
	
	index: function(lang, tags, localizacao) {
	    var tags = tags || '',
	    lang = lang || '';
	    localizacao = localizacao || '';
	    
	    var indexView = new IndexView();
	    indexView.render(lang, tags, localizacao);
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