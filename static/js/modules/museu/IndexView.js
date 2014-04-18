define([
    'jquery', 
    'underscore',
    'backbone',
    'tagcloud',
    'modules/museu/model',
    'modules/museu/collection',
    'modules/config/model',
    'modules/tag/model',
    'text!templates/header.html',
    'text!templates/tags.html',
    'text!templates/museu/MuseuIndex.html',
    'text!templates/museu/MuseuHome.html',
    'text!templates/museu/MuseuFotos.html',
    'text!templates/museu/MuseuMapa.html',
    'text!templates/museu/MuseuPlanta.html',
    'text!templates/museu/MuseuNavigation.html',
], function($, _, Backbone, TagCloud, MuseuModel, MuseuCollection, ConfigModel, TagModel, HeaderTpl, TagsTpl, MuseuIndexTpl, MuseuHomeTpl, MuseuFotosTpl, MuseuMapaTpl, MuseuPlantaTpl, MuseuNavigationTpl){
    var IndexView = Backbone.View.extend({
	
	render: function(lang, tags){
	    var tags = tags || '',
	    lang = lang || '';
	    
	    //// _generate_tag_cloud
	    _generate_tag_cloud = function() {
		var tags = new TagModel();
		tags.fetch({
		    success: function() {
			data = {
			    tags: tags.attributes
			}
			
			var compiledTags = _.template(TagsTpl, data);
			$('#header-tags').html(compiledTags);
			
			$.fn.tagcloud.defaults = {
			    size: {start: 14, end: 18, unit: 'pt'},
			    color: {start: '#fada53', end: '#fada53'}
			};
			
			$(function () {
			    $('#tag_cloud a').tagcloud();
			});
		    }
		});
	    }

	    //// toggle_museu
	    // - expande / contrái museu e chama home
	    toggle_museu = function(e) {
		// pega variaveis basicas
		var target = e.currentTarget,
		match = /^\w*_(\d*)$/.exec(target.id),
		nid = match[1];
		
		// toggle q abre/fecha museu
		_toggle_home_div(target, nid);
		
		// inicializa museu internamente	
		_init_museu(nid);
	    }
	    
	    //// _load_config
	    // - carrega configuracoes da api/json
	    _load_config = function() {
		this.config = {};
		var config = new ConfigModel();
		config.fetch({
		    success: function() {
			configs = config.attributes;
			_.each(configs, function(config) {
			    this.config[config.name] = config.value
			});
		    }
		});
	    }
	    
	    //// _init_museu
	    // - carrega varias informacoes do museu quando ele é clicado
	    // - inicia navegacao no museu particular
	    _init_museu = function(nid) {
		
		// carrega vazio primeiro
		_load_museu_home(lang, nid);
		
		var museu = new MuseuModel({nid: nid, lang: lang});
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
	    _load_museu_home = function(lang, nid, dataMuseu) {
		var defaultDataMuseu = {museu: { nid: nid, lang: lang } },
		dataMuseu = dataMuseu || defaultDataMuseu,
		el = "#nid_" + nid + " .subpages-container",
		el_off = '',
		el_div = '';

		console.log("lang:" + lang);
		
		var compiledHomeTpl = _.template(MuseuHomeTpl, dataMuseu);
		
		if (dataMuseu == defaultDataMuseu) {
		    // carrega div ainda sem conteudo e anima deslocamento
		    $(el).html(compiledHomeTpl);
		    $(el).animate(
			{ height: this.config['museuDivHeight'] },
			{ duration: this.config['transitionScrollDuration'] }
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
			{ duration: this.config['transitionOpacityDuration'] }
		    );
		    _toggle_navigation(nid);
		}
	    }
	    
	    //// _load_museu_tabs
	    // - carrega outras tabs/janelas
	    _load_museu_tabs = function(lang, nid, dataMuseu) {
		var compiledFotosTpl = _.template(MuseuFotosTpl, dataMuseu);
		var compiledMapaTpl = _.template(MuseuMapaTpl, dataMuseu);
		var compiledPlantaTpl = _.template(MuseuPlantaTpl, dataMuseu);
		
		var museu_tabs = [],
		el = '',
		
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
		var museu_ativo = '',
		el_fechar = '',
		nid_fechar = '',
		nav_fechar = '',
		el_onclick = '';
		

		if ($('body').data('museu_ativo')) {
		    museu_ativo = $('body').data('museu_ativo');
		    el_fechar = museu_ativo;
		    
		    // restaura estado do museu ativo
		    $(el_fechar).animate(
			{ height: "0" },
			{ duration: this.config['transitionScrollDuration'] }
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
		var el = "#nid_" + nid;
		
		$(el).prepend(MuseuNavigationTpl);
		$(el + " .left").on('click', (function(e) { _navigate(nid, 'left') }));
		$(el + " .right").on('click', (function(e) { _navigate(nid, 'right') }));
	    }
	    
	    //// _toggle_navigation_buttons
	    // - liga/desliga botoes de navegacao
	    _toggle_navigation_buttons = function(nid, status) {
		var el = "#nid_" + nid;
		
		if (status == true) { 
		    $(el + " .left").on('click', (function(e) { _navigate(nid, 'left') }));
		    $(el + " .right").on('click', (function(e) { _navigate(nid, 'right') }));
		} else {
		    $(el + " .left").off('click');
		    $(el + " .right").off('click');
		}
	    }

	    // gerencia navegacao
	    _navigate = function(nid, direction) {
		var museu_tab_ativo = '',
		museus_tabs = '',
		tabs_size = '',
		id_ativo = '',
		id_next = '',
		museu_tab_next = '';
		
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
			console.log('move pra esquerda');
			id_next = id_ativo -1;
			museu_tab_next = museu_tabs[id_next];
			_reposition_tabs(nid, direction);
		    }
		}
		
		if (direction == 'right') {
		    if (id_ativo == tabs_size) {
			console.log('fim. fica parado');
			return false;
		    } else {
			console.log('move pra direita');
			id_next = id_ativo +1;
			museu_tab_next = museu_tabs[id_next];
			_reposition_tabs(nid, direction);
		    }
		}
		
		$('body').data('museu_tab_ativo', museu_tab_next);
	    }

	    // executa navegacao
	    _reposition_tabs = function(nid, direction) {
		var factor = '',
		current_position = '',
		museu_tabs = '',
		position = '';
		
		_toggle_navigation_buttons(nid, false); // desativa botoes (inicio)
		factor = (direction == 'left') ? 1 : -1;
		museu_tabs = $('body').data('museu_tabs');
		_.each(museu_tabs, function(museu_tab) {
		    // crossbrowser para pegar 'left'
		    current_position =	$(museu_tab).css('left');
		    if (current_position.search(/px/) != -1) {
			// firefox
			current_position = parseInt(_.first(current_position.split('px')));
		    } else {
			// chromium
			current_position = (current_position == 'auto') ? 0 : current_position;
			document.title = current_position;
		    }
		    position = parseInt(eval(current_position + (factor * this.config['museuWidth']))) + 'px';
		    $(museu_tab).animate({ 
			left: position 
		    }, this.config['navigationScrollDuration'], function() {
			// complete
			if (museu_tab == _.last(museu_tabs)) {
			    _toggle_navigation_buttons(nid, true); // ativa botoes (fim)
			}
		    });    
		});
	    }
	    
	    // carrega museus - tela inicial
	    _load_museus = function(lang, tags) {
		var tags = tags || '',
		lang = lang || '',
		el_onclick = '',
		mensagem = '';
		
		// armazena museu ativo
		$('body').data('museu_ativo', false);
		
		var museus = new MuseuCollection([]);
		museus.url += lang + '/' + tags;
		museus.lang = lang;
		museus.tags = tags;
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

			// seta tags (se houver)
			if (tags != '') {
			    mensagem = 'exibindo museus de '
			    $('#filter-tags').prepend("<p class='title'>" + mensagem + "<span class='tag-title'>" + tags + "</span></p>");
			    document.title = 'portal MuseusBR - ' + mensagem + "'" + tags + "'";
			} else {
			    mensagem = 'portal MuseusBR';
			    document.title = mensagem;
			}
		    }
		});
	    }
	    
	    if (lang == '') {
		$.ajax({
		    url: "userlang.php", 
		    dataType: 'json', 
		    success: function(data) {
			$('#headerUrl').attr('href', '#'  + data.userLang);
		    }
		});
	    }
	    
	    var compiledHeader = _.template(HeaderTpl);
	    $('#header').html(compiledHeader, lang);
	    $('#content').html('<p class="loading">carregando conteúdo...</p>');
	    _load_config();
	    _generate_tag_cloud(); // TODO: colocar check pra ver se ja carregou & manter expandido
	    
	    _load_museus(lang, tags);
	},
    });
    
    return IndexView;
});