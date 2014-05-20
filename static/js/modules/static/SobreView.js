define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/header.html',
    'text!templates/sobre.html',
], function($, _, Backbone, HeaderTpl, SobreTpl){
    var SobreView = Backbone.View.extend({
	
	render: function(lang){
	    var pointer = setInterval(function() {	
		if (!_.isEmpty($('body').data('mensagens'))) {
		    data = {
			carregandoTags: '&nbsp;',
			mensagens: $('body').data('mensagens'),
			lang: $('body').data('userLang'),
		    }
		    
		    var compiledHeader = _.template(HeaderTpl, data);
		    $('#header').html(compiledHeader, lang);
		    
		    var compiledTemplate = _.template(SobreTpl, data);
		    $('#content').html(compiledTemplate);
		    
		    clearInterval(pointer);
		}
	    }, 50);
	}
    });
    return SobreView;
});