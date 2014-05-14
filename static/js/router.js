define([
    'jquery', 
    'backbone',
    'modules/museu/model',
    'modules/museu/IndexView',
    'modules/static/SobreView',
    'modules/config/functions',
    'modules/mensagens/functions',
], function($, Backbone, MuseuModel, IndexView, SobreView, ConfigFunctions, MensagensFunctions){
    var App = {};
    
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    ':lang/sobre' : 'sobre',
	    ':lang/termos-de-uso' : 'termosDeUso',
	    ':lang/:tags/:localizacao' : 'index',
	    ':lang/:tags' : 'index',
	    ':lang' : 'index',
	    '' : 'index',
	},
	
	index: function(lang, tags, localizacao) {
	    var tags = tags || '',
	    lang = lang || '';
	    localizacao = localizacao || '';

	    // confs do museu
	    ConfigFunctions.loadConfig();
	    MensagensFunctions.loadMensagens(lang);
	    
	    var indexView = new IndexView();
	    indexView.render(lang, tags, localizacao);
	},

	sobre: function(lang) {
	    var lang = lang || '';

	    // confs do museu
	    ConfigFunctions.loadConfig();
	    MensagensFunctions.loadMensagens(lang);
	    
	    var sobreView = new SobreView();
	    sobreView.render(lang);	    
	},

	termosDeUso: function(lang) {
	    var lang = lang || '';
	    
	    // confs do museu
	    ConfigFunctions.loadConfig();
	    MensagensFunctions.loadMensagens(lang);
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