define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/config/model',
    'json!site-config.json',
], function($, _, Backbone, ConfigModel, SiteConfig){

    var rolarSecao = function(nome, espacoExtra = 0) {
	var nome = nome || '',
	    espacoExtra = espacoExtra || 0,
	    alturaEl = $(nome).offset();
	alturaEl.top -= espacoExtra;
	window.scroll(alturaEl);
    }

    var __escolheMetodoAbrirLink = function(secao) {
	var currentUrl = Backbone.history.location.hash;
	if (currentUrl == "" ||
	    currentUrl == "#" + data.lang ||
	    (currentUrl.match(/#/g) || []).length == 2) {
	    rolarSecao('#bloco-' + secao, 200);
	} else {
	    window.location.hash = '#' + data.lang + '/#' + secao;
	}
    }
    
    var carregaMenu = function() {
	$('#link-blog').click(function() {
	    __escolheMetodoAbrirLink('blog');
	});
	
	$('#link-dicas').click(function() {
	    __escolheMetodoAbrirLink('dicas');
	});
	
	$('#link-encontre').click(function() {
	    __escolheMetodoAbrirLink('encontre');
	});
    }
    
    
    return {
	carregaMenu: carregaMenu,
	rolarSecao: rolarSecao
    }
});
