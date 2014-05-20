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
			mensagemTermosDeUsoTitulo: $('body').data('mensagens').mensagemTermosDeUsoTitulo,
			mensagemTermosDeUsoTexto: $('body').data('mensagens').mensagemTermosDeUsoTexto,
			lang: $('body').data('userLang'),
		    }
		    console.log(data);
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