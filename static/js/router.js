define([
    'jquery', 
    'backbone',
    'modules/museu/model',
    'modules/museu/IndexView',
    'modules/static/SobreView',
    'modules/static/TermosDeUsoView',
    'modules/config/functions',
    'modules/mensagens/functions',
], function($, Backbone, MuseuModel, IndexView, SobreView, TermosDeUsoView, ConfigFunctions, MensagensFunctions){
    var App = {};
    
    App.Router = Backbone.Router.extend({
	Routers: {},
	
	routes: {
	    ':lang/page/:page' : 'staticPages',
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
	    
	    var pointer = setInterval(function() {	
		if (!_.isEmpty($('body').data('mensagens'))) {
		    var indexView = new IndexView();
		    indexView.render(lang, tags, localizacao);		    
		    clearInterval(pointer);
		}
	    }, 50);
	},

	staticPages: function(lang, page) {
	    var lang = lang || $('body').data('userLang');
	    var page = page || '';
	    
	    if (page == 'sobre') {
		var pageView = new SobreView();
	    } else if (page == 'termos-de-uso') {
		var pageView = new TermosDeUsoView();
	    }
	    
	    // confs do museu
	    ConfigFunctions.loadConfig();
	    if (lang == '') {
		$.ajax({
		    url: "userlang.php", 
		    dataType: 'json', 
		    success: function(data) {
			lang = data.userLang;
			ConfigFunctions.set_user_lang(lang);
			MensagensFunctions.loadMensagens(lang);
			pageView.render(lang);
		    }
		});
	    } else {
		ConfigFunctions.set_user_lang(lang);
		MensagensFunctions.loadMensagens(lang);
		var termosDeUsoView = new TermosDeUsoView();
		pageView.render(lang);
	    }
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