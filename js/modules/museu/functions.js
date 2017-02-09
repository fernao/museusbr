define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/config/model',
    'json!site-config.json',
], function($, _, Backbone, ConfigModel, SiteConfig){

    var rolarSecao = function(nome) {
	var alturaEl = $(nome).offset();
	alturaEl.top -= 80;
	window.scroll(alturaEl);
    }
    
    var carregaMenu = function() {
	$('#link-blog').click(function() {
	    if (Backbone.history.location != '#' + data.lang) {
		window.location.hash = '#' + data.lang + '/#blog';
	    } else {
		rolarSecao('#bloco-blog');
	    }
	});
	
	$('#link-dicas').click(function() {
	    if (Backbone.history.location != '#' + data.lang) {
		window.location.hash = '#' + data.lang + '/#dicas';
	    } else {
		rolarSecao('#bloco-dicas');
	    }
	});
	
	$('#link-encontre').click(function() {
	    if (Backbone.history.location != '#' + data.lang) {
		window.location.hash = '#' + data.lang + '/#encontre';
	    } else {
		rolarSecao('#bloco-encontre');
	    }
	});
    }
    
    
    return {
	carregaMenu: carregaMenu,
	rolarSecao: rolarSecao
    }
});
