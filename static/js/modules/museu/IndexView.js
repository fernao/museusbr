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
			_load_museu_tabs(nid, dataMuseu);
		    }
		});
	    }
	    
	    //// _load_museu_home
	    // - carrega home do museu
	    _load_museu_home = function(nid, dataMuseu) {
		defaultDataMuseu = {museu: { nid: nid } };
		
		dataMuseu = dataMuseu || defaultDataMuseu;
		var compiledHomeTpl = _.template(MuseuHomeTpl, dataMuseu);
		el = "#nid_" + nid + " .subpages-container";
				
		if (dataMuseu == defaultDataMuseu) {
		    // carrega div ainda sem conteudo e anima deslocamento
		    $(el).html(compiledHomeTpl);
		    $(el).animate(
			{ height: "200" },
			{ duration: 400 }
		    );

		    // unbind click event
		    el_off = '#nid_' + nid;
		    $(el_off).css('cursor', 'default');
		    $(el_off).off('click');
		    
		} else {
		    // carrega conteudo dentro da div e anima fade in
		    $(el).html(compiledHomeTpl);
		    el_div = el + " .page"
		    $(el_div).animate(
			{ opacity: 1 },
			{ duration: 150 }
		    );
		    _toggle_navigation(nid);
		}
	    }
	    
	    //// _load_museu_tabs
	    // - carrega outras tabs/janelas
	    _load_museu_tabs = function(nid, dataMuseu) {
		var compiledFotosTpl = _.template(MuseuFotosTpl, dataMuseu);
		var compiledMapaTpl = _.template(MuseuMapaTpl, dataMuseu);
		var compiledPlantaTpl = _.template(MuseuPlantaTpl, dataMuseu);
		
		museu_tabs = {
		    0: 'home_museu' + nid,
		    1: 'fotos_museu_' + nid,
		    2: 'mapa_museu' + nid,
		    3: 'planta_museu_' + nid,
		};
		museu_ativo = $('body').data('museu_tabs', museu_tabs);
		
		el = "#nid_" + nid + " .subpages-container";
		$(el).append(compiledFotosTpl);
		$(el).append(compiledMapaTpl);
		$(el).append(compiledPlantaTpl);		
	    }
	    
	    _toggle_home_div = function(el, nid) {

		if ($('body').data('museu_ativo')) {
		    museu_ativo = $('body').data('museu_ativo');
		    el_fechar = museu_ativo;
		    
		    // restaura estado do museu ativo
		    $(el_fechar).animate(
			{ height: "0" },
			{ duration: 400 }
		    );
		    //$(el_fechar).css('height', 0); // TODO: puxar das settings 
		    $(el_fechar).html('');
		    el_onclick = el_fechar.replace(' .subpages-container', '');
		    $(el_onclick).css('cursor', 'pointer');
		    $(el_onclick).on('click', toggle_museu);
		}
		
		// define novo museu aberto
		$('body').data('museu_ativo', '#nid_' + nid + " .subpages-container");
	    }
	    
	    //// _toggle_navigation
	    // - coloca/tira setas 
	    _toggle_navigation = function(nid) {
		el = "#nid_" + nid + " .museu-subpages";

		$(el).prepend(MuseuNavigationTpl);
		$(el + " #left").on('click', (function(e) { _navigate(nid, 'left') }));
		$(el + " #right").on('click', (function(e) { _navigate(nid, 'right') }));
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
			museus_list = museus.models[0].attributes;
			nodes = museus_list;
			data = {
			    nodes: nodes
			}
			
			var compiledTemplate = _.template(MuseuIndexTpl, data);
			$('#content').html(compiledTemplate);
			
			// bind click event 
			_.each(museus_list, function(museu) {
			    el_onclick = '#nid_' + museu.nid;
			    $(el_onclick).css('cursor', 'pointer');
			    $(el_onclick).on('click', toggle_museu);
			});
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