define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/museu/model',
    'modules/museu/collection',
    'text!templates/header.html',
    'text!templates/museu/MuseuIndex.html',
    'text!templates/museu/MuseuHome.html',
    'text!templates/museu/MuseuFotos.html',
    'text!templates/museu/MuseuMapa.html',
    'text!templates/museu/MuseuPlanta.html',
    'text!templates/museu/MuseuNavigation.html',
], function($, _, Backbone, MuseuModel, MuseuCollection, Header, MuseuIndexTpl, MuseuHomeTpl, MuseuFotosTpl, MuseuMapaTpl, MuseuPlantaTpl, MuseuNavigationTpl){
    var IndexView = Backbone.View.extend({
	
	render: function(){

	    //// toggle_museu
	    // - expande / contrái museu e chama home
	    toggle_museu = function(e) {
		// pega variaveis basicas
		var target = e.currentTarget;
		var match = /^\w*_(\d*)$/.exec(target.id);
		var nid = match[1];
		
		// toggle q abre/fecha museu
		_toggle_home_div(target, nid);
		
		// inicializa museu internamente	
		_init_museu(nid);
	    }
	    
	    //// _init_museu
	    // - carrega varias informacoes do museu quando ele é clicado
	    // - inicia navegacao no museu particular
	    _init_museu = function(nid) {
		
		// carrega vazio primeiro
		_load_museu_home(nid);
		
		var museu = new MuseuModel({nid: nid});
		museu.fetch({
		    success: function() {
			dataMuseu = {
			    museu: museu.attributes[0]
			}
			_load_museu_home(nid, dataMuseu);
		    }
		});
	    }
	    
	    //// _load_museu_home
	    // - carrega home do museu
	    _load_museu_home = function(nid, dataMuseu) {
		defaultDataMuseu = {museu: { nid: nid } };
		
		dataMuseu = dataMuseu || defaultDataMuseu;
		var compiledHomeTpl = _.template(MuseuHomeTpl, dataMuseu);
		if (dataMuseu == defaultDataMuseu) {
		    $("#nid_" + nid).html(compiledHomeTpl);
		} else {
		    $("#nid_" + nid).html(compiledHomeTpl);
		    _toggle_navigation(nid);
		}
	    }
	    
	    _toggle_home_div = function(el, nid) {

		if ($('body').data('museu_ativo')) {
		    museu_ativo = $('body').data('museu_ativo');
		    el_fechar = museu_ativo  + " .museu-subpages";
		    
		    // restaura estado do museu ativo
		    // TODO: colocar transicoes
		    $(museu_ativo).css('height', 97); // TODO: puxar das settings 
		    $(el_fechar).remove();
		}
		
		// define novo museu aberto
		$('body').data('museu_ativo', '#nid_' + nid);
		
		// TODO: colocar transicoes
		$(el).css('height', '200'); // TODO: puxar das settings
	    }
	    
	    //// _toggle_navigation
	    // - coloca/tira setas 
	    _toggle_navigation = function(nid) {
		el = "#nid_" + nid;

		$(el).prepend(MuseuNavigationTpl);
		$(el + " #left").click(function(e) { _navigate(nid, 'left') });
		$(el + " #right").click(function(e) { _navigate(nid, 'right') });
	    }
	    
	    _navigate = function(nid, direction) {
		// pegar o estado atual?
		
		console.log(direction);
		// gerencia setas
	    }
	    
	    // carrega museus - tela inicial
	    _load_museus = function() {
		// armazena museu ativo
		$('body').data('museu_ativo', false);
		
		var museus = new MuseuCollection([]);
		museus.fetch({
		    success: function() {
			nodes = museus.models[0].attributes;
			data = {
			    nodes: nodes
			}
			
			var compiledTemplate = _.template(MuseuIndexTpl, data);
			$('#content').html(compiledTemplate);
			$('div.museu-row').click(function(e) { toggle_museu(e) });
		    }
		});
	    }
	    
	    var compiledHeader = _.template(Header);
	    $('#header').html(compiledHeader);
	    
	    _load_museus();
	},
    });
    
    return IndexView;
});