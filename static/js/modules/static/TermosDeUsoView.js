define([
    'jquery', 
    'underscore',
    'backbone',
    'text!templates/header.html',
    'text!templates/termos-de-uso.html',
], function($, _, Backbone, HeaderTpl, TermosDeUsoTpl){
    var TermosDeUsoView = Backbone.View.extend({
	
	render: function(lang){
	    var pointer = setInterval(function() {	
		if (!_.isEmpty($('body').data('mensagens'))) {
		    data = {
			carregandoTags: '&nbsp;',
			mensagens: $('body').data('mensagens'),
			lang: $('body').data('userLang'),
		    }
		    $('body').removeClass();
		    $('body').addClass('page-termos');		    
		    var compiledHeader = _.template(HeaderTpl, data);
		    $('#header').html(compiledHeader, lang);
		    
		    var compiledTemplate = _.template(TermosDeUsoTpl, data);
		    $('#content').html(compiledTemplate);
		    
		    clearInterval(pointer);
		}
	    }, 50);
	}
    });
    return TermosDeUsoView;
});