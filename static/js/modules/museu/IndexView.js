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
		
		var museu_tabs = [];
		museu_tabs = ['#home_museu_' + nid, '#fotos_museu_' + nid, '#mapa_museu_' + nid, '#planta_museu_' + nid];
		$('body').data('museu_tabs', museu_tabs);
		$('body').data('museu_tab_ativo', museu_tabs[0]); // inicializa na home
		
		el = "#nid_" + nid + " .subpages-container";
		$(el).append(compiledFotosTpl);
		$(el).append(compiledMapaTpl);
		$(el).append(compiledPlantaTpl);
		$(el + ' .page').css('opacity', 1);
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
		    
		    // limpa museu anterior
		    nid_fechar = el_fechar.split(' ');
		    nid_fechar = _.last(nid_fechar[0].split('_'));
		    nav_fechar = "#nid_" + nid_fechar + " #navigation";
		    $(nav_fechar).remove();
		    el_onclick = el_fechar.replace(' .subpages-container', '');
		    $(el_fechar).html('');
		    
		    // restaura eventos e cursor do museu anterior
		    $(el_onclick).css('cursor', 'pointer');
		    $(el_onclick).on('click', toggle_museu);
		}
		
		// define novo museu aberto
		$('body').data('museu_ativo', '#nid_' + nid + " .subpages-container");
	    }
	    
	    //// _toggle_navigation
	    // - coloca/tira setas 
	    _toggle_navigation = function(nid) {
		el = "#nid_" + nid;

		$(el).prepend(MuseuNavigationTpl);
		$(el + " #left").on('click', (function(e) { _navigate(nid, 'left') }));
		$(el + " #right").on('click', (function(e) { _navigate(nid, 'right') }));
	    }
	    
	    _navigate = function(nid, direction) {
		// pega o estado atual
		museu_tab_ativo = $('body').data('museu_tab_ativo');
		museu_tabs = $('body').data('museu_tabs');
		tabs_size = museu_tabs.length - 1;
		id_ativo = _.indexOf(museu_tabs, museu_tab_ativo);

		if (direction == 'left') {
		    if (id_ativo === 0) {
			// TODO: desligar botao caso esteja no comeco
			console.log('comeco. fica parado');
			return false;
		    } else {
			// TODO: unificar numa so funcao ambas as tarefas
			console.log('move pra esquerda');
			id_next = id_ativo -1;
			museu_tab_next = museu_tabs[id_next];
			_reposition_tabs(direction);
		    }
		}
		
		if (direction == 'right') {
		    if (id_ativo == tabs_size) {
			console.log('fim. fica parado');
			return false;
		    } else {
			// TODO: unificar numa so funcao ambas as tarefas
			console.log('move pra direita');
			id_next = id_ativo +1;
			museu_tab_next = museu_tabs[id_next];
			_reposition_tabs(direction);
		    }
		}
		
		$('body').data('museu_tab_ativo', museu_tab_next);
	    }

	    _reposition_tabs = function(direction) {
		factor = (direction == 'left') ? 1 : -1;
		museu_tabs = $('body').data('museu_tabs');
		_.each(museu_tabs, function(museu_tab) {
		    current_position = parseInt(_.first($(museu_tab).css('left').split('px')));
		    position = parseInt(eval(current_position + (factor * 1020))) + 'px';
		    $(museu_tab).animate(
			{ left: position },
			{ duration: 600 }
		    );
		});
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