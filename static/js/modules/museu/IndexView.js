define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/museu/model',
    'modules/museu/collection',
    'modules/config/model',
    'modules/mensagens/model',
    'modules/tag/model',
    'text!templates/header.html',
    'text!templates/tags.html',
    'text!templates/museu/MuseuIndex.html',
    'text!templates/museu/MuseuHome.html',
    'text!templates/museu/MuseuFotos.html',
    'text!templates/museu/MuseuMapa.html',
    'text!templates/museu/MuseuPlanta.html',
    'text!templates/museu/MuseuNavigation.html',
], function($, _, Backbone, MuseuModel, MuseuCollection, ConfigModel, MensagensModel, TagModel, HeaderTpl, TagsTpl, MuseuIndexTpl, MuseuHomeTpl, MuseuFotosTpl, MuseuMapaTpl, MuseuPlantaTpl, MuseuNavigationTpl){
    var default_lang = '';
    var IndexView = Backbone.View.extend({
	
	render: function(lang, tags){
	    var tags = tags || '',
	    lang = lang || '';
	    
	    //// _generate_tag_cloud
	    _generate_tag_cloud = function(tag_atual) {
		var tag_atual = tag_atual || '';
		var tags = new TagModel();
		tags.fetch({
		    success: function() {
			data = {
			    tags: tags.attributes,
			    tag_atual: tag_atual,
			    lang: $('body').data('userLang')
			}
			
			var compiledTags = _.template(TagsTpl, data);
			$('#header-tags').html(compiledTags);
		    }
		});
	    }

	    //// get_default_lang
	    // - pega lang default do usuario
	    get_user_lang = function() {
		lang = $('body').data('userLang');
		return lang;
	    }
	    
	    set_user_lang = function(lang) {
		$('body').data('userLang', lang);
	    }

	    //// toggle_museu
	    // - expande / contrái museu e chama home
	    toggle_museu = function(e) {
		// pega variaveis basicas
		var target = e.currentTarget,
		match = /^\w*_(\d*)$/.exec(target.id),
		nid = match[1],
		lang = get_user_lang(),
		museu_ativo = '';
		museu_clicado = '#nid_' + nid + ' .subpages-container';
		
		museu_ativo = $('body').data('museu_ativo');
		// toggle q abre/fecha museu
		_toggle_home_div(target, nid);
		if (museu_ativo != museu_clicado) {		
		    // inicializa museu internamente	
		    _init_museu(lang, nid);
		}
	    }
	    
	    _close_museu = function(target) {
		var nid_fechar = '',
		nav_fechar = '',
		el_onclick = '';
		
		// restaura estado do museu ativo
		$(target).animate(
		    { height: "0" },
		    { duration: this.config['transitionScrollDuration'] }
		);
		
		// limpa museu anterior
		nid_fechar = target.split(' ');
		nid_fechar = _.last(nid_fechar[0].split('_'));
		nav_fechar = "#nid_" + nid_fechar + " #navigation";
		$(nav_fechar).remove();
		el_onclick = target.replace(' .subpages-container', '');
		$(target).html('');
		
		$('body').data('museu_ativo', '');
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
	    
	    _load_mensagens = function(lang) {
		this.mensagens = {};
		var mensagens = new MensagensModel();
		mensagens.url += lang;
		mensagens.fetch({
		    success: function() {
			msgs = mensagens.attributes;
			_.each(msgs, function(msg) {
			    this.mensagens[msg.name] = msg.value
			});
		    }
		})
	    }

	    //// _init_museu
	    // - carrega varias informacoes do museu quando ele é clicado
	    // - inicia navegacao no museu particular
	    _init_museu = function(lang, nid) {
		// carrega vazio primeiro
		_load_museu_home(lang, nid);
		
		var museu = new MuseuModel({nid: nid});
		museu.url += lang + '/' + nid;
		museu.fetch({
		    success: function() {
			dataMuseu = {
			    museu: museu.attributes[0]
			}
			_load_museu_home(lang, nid, dataMuseu);
			_load_museu_tabs(lang, nid, dataMuseu);
		    }
		});
	    }
	    
	    //// _load_museu_home
	    // - carrega home do museu
	    _load_museu_home = function(lang, nid, dataMuseu) {
		var defaultDataMuseu = {museu: { nid: nid} },
		lang = lang || get_user_lang(),
		dataMuseu = dataMuseu || defaultDataMuseu,
		el = "",
		el_off = '',
		el_div = '';
		el = "#nid_" + nid + " .subpages-container";
		var compiledHomeTpl = _.template(MuseuHomeTpl, dataMuseu);
		
		if (dataMuseu == defaultDataMuseu) {
		    // carrega div ainda sem conteudo e anima deslocamento
		    $(el).html(compiledHomeTpl);
		    $(el).animate(
			{ height: this.config['museuDivHeight'] },
			{ duration: this.config['transitionScrollDuration'] }
		    );
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
		var museu_ativo = '';		
		
		if ($('body').data('museu_ativo') != '') {
		    museu_ativo = $('body').data('museu_ativo');	    
		    _close_museu(museu_ativo);
		} else {
		    // define novo museu aberto
		    $('body').data('museu_ativo', '#nid_' + nid + " .subpages-container");		    
		}
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
		$('body').data('museu_ativo', '');
		
		var museus = new MuseuCollection([]);
		museus.url += lang + '/' + tags;
		museus.lang = lang;
		museus.tags = tags;

		museus.fetch({
		    success: function() {
			museus_list = museus.models[0].attributes;
			nodes = museus_list;
			
			data = {
			    nodes: nodes,
			    emptyMessage: this.mensagens['naoEncontrado']
			}
			
			var compiledTemplate = _.template(MuseuIndexTpl, data);
			$('#content').html(compiledTemplate);
			
			// bind click event 
			_.each(museus_list, function(museu) {
			    el_onclick = '#btnnid_' + museu.nid;
			    $(el_onclick).css('cursor', 'pointer');
			    $(el_onclick).on('click', toggle_museu);
			});

			// seta tags (se houver)
			if (tags != '') {
			    document.title = this.mensagens['portalMuseuBr'] + ' - ' + this.mensagens['exibindoMuseusDe'] + tags.toUpperCase();
			} else {
			    document.title = this.mensagens['portalMuseuBr'];
			}
		    }
		});
	    }
	    
	    // init main functionalities
	    _init_main = function(lang) {
		data = {
		    carregandoTags: '&nbsp;',
		    lang: $('body').data('userLang')
		}
		
		if ($('#header').html() == '') {
		    var compiledHeader = _.template(HeaderTpl, data);
		    $('#header').html(compiledHeader, lang);
		}
		$('#content').html("<div class='loading'></div>");
		_generate_tag_cloud(tags); // TODO: colocar check pra ver se ja carregou & manter expandido
		_load_museus(lang, tags);		
	    }
	    
	    _load_config();
	    _load_mensagens(lang);
	    
	    // language check for sending to init_main
	    if (lang == '') {
		$.ajax({
		    url: "userlang.php", 
		    dataType: 'json', 
		    success: function(data) {
			lang = data.userLang;
			set_user_lang(lang);
			$('#headerUrl').attr('href', '#'  + lang);
			_init_main(lang);
		    }
		});
	    } else {
		set_user_lang(lang);
		_init_main(lang);
	    }
	    
	},
    });
    
    return IndexView;
});