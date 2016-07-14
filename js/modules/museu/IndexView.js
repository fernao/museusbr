define([
    'jquery', 
    'underscore',
    'backbone',
    'tagcloud',
    'modules/config/functions',
    'json!site-config.json',
    'modules/museu/model',
    'modules/museu/collection',
    'modules/config/model',
    'modules/mensagens/model',
    'modules/tag/model',
    'modules/localizacao/model',
    'text!templates/header.html',
    'text!templates/footer.html',
    'text!templates/mapa.html',
    'text!templates/regiao.html',
    'text!templates/tags.html',
    'text!templates/museu/MuseuIndex.html',
    'text!templates/museu/MuseuHome.html',
    'text!templates/museu/MuseuImagens.html',
    'text!templates/museu/MuseuMapa.html'
], function($, _, Backbone, TagCloud, ConfigFunctions, SiteConfig, MuseuModel, MuseuCollection, ConfigModel, MensagensModel, TagModel, LocalizacaoModel, HeaderTpl, FooterTpl, MapaTpl, RegiaoTpl, TagsTpl, MuseuIndexTpl, MuseuHomeTpl, MuseuImagensTpl, MuseuMapaTpl){
    var default_lang = '';
    var IndexView = Backbone.View.extend({
	
	render: function(lang, tags, localizacao){
	    var tags = tags || '',
	    lang = lang || '',
	    localizacao = localizacao || '';

	    _get_regioes = function() {
		return ['norte', 'nordeste', 'centro-oeste', 'sul', 'sudeste'];
	    }

	    _get_localizacao_tids = function(localizacao) {
		var localizacao_str = '',
		l = 0,
		maxL = _.size(localizacao);
		for (l = 0; l < maxL; l+= 1) {
		    localizacao_str += localizacao[l].tid;
		    if (l <= maxL -2) {
			localizacao_str += ',';
		    }
		}
		return localizacao_str;
	    }
	    
	    _generate_header = function(tag, localizacao) {
		var tag = tag || 'todos',
		localizacao = localizacao || 'brasil',
		lang = $('body').data('userLang'),
		regioes = _get_regioes(),
		localizacao_tids = '',
		regiao = '',
		is_cidade = false,
		is_regiao = false;
		
		var localizacaoModel = new LocalizacaoModel();		
		
		// recebeu REGIAO
		// chama url que retorna ids das cidades da regiao, para uso interno da url rest
		if (_.contains(regioes, localizacao)) { 
		    is_regiao = true;
		    localizacaoModel.url +=  localizacao;
		    regiao = localizacao;
		}
		
		//recebeu CIDADE
		if ($.isNumeric(localizacao)) {
		    is_cidade = true;
		    localizacaoModel.url +=  'regiao/' + localizacao;
		}
		
		if (localizacao == 'brasil') {
		   regiao = localizacao; 
		}	
	
		localizacaoModel.fetch({
		    success: function() {
			var tags = new TagModel();
			
			// regiao: transforma lista de cidades em argumentos tids
			if (is_regiao) { 
			    localizacao_tids = _get_localizacao_tids(localizacaoModel.attributes);
			}
			
			// cidades: gera lista de cidades com o atributo regiao que acabou de descobrir
			if (is_cidade) {
			    localizacao_tids = localizacao;
			    regiao = localizacaoModel.attributes[0].name;
			    
			    var cidadesModel = new LocalizacaoModel();
			    cidadesModel.url += regiao;
			    // pega lista de cidades
			    cidadesModel.fetch({
				success: function() {
				    data = { 
					cidades: cidadesModel.attributes,
					regiao: regiao,
					localizacao_atual: localizacao,
					tags: tag,
					mensagens: $('body').data('mensagens'),
					lang: ConfigFunctions.get_user_lang()
				    }	
				    
				    var compiledMapa = _.template(MapaTpl, data);
				    $('#mapa-posicao').html(compiledMapa);	    
				    var compiledRegiao = _.template(RegiaoTpl, data);
				    $('#lista-cidades').html(compiledRegiao);
				}
			    });
			}
			
			// TAGS
			// localizacao passada deve ser um tid
			tags.url = SiteConfig.baseUrl + '/tagcloud/' + lang + '/' + localizacao_tids;			    
			tags.fetch({
			    success: function() {
				data = {
				    tags: tags.attributes,
				    tag: tag,
				    mensagens: $('body').data('mensagens'),
				    localizacao: localizacao,
				    lang: lang
				}
				
				var compiledTags = _.template(TagsTpl, data);
				console.log(compiledTags);
				$('#tag_cloud').html(compiledTags);
				
				$.fn.tagcloud.defaults = {
				    size: {start: 14, end: 20, unit: 'pt'},
				    color: {start: '#fada53', end: '#fada53'}
				};
				
				$(function () {
				    $('#tag_cloud a').tagcloud();
				});
			    }
			});
			
			if (is_regiao || localizacao == 'brasil') {
			    data = { 
				cidades: localizacaoModel.attributes,
				regiao: regiao,
				localizacao_atual: localizacao,
				tags: tag,
				mensagens: $('body').data('mensagens'),
				lang: ConfigFunctions.get_user_lang()
			    }
			    
			    var compiledMapa = _.template(MapaTpl, data);
			    $('#mapa-posicao').html(compiledMapa);	    
			    var compiledRegiao = _.template(RegiaoTpl, data);
			    $('#lista-cidades').html(compiledRegiao);	    
			}
		    }
		});	
	    }
	    
	    
	    //// toggle_museu
	    // - expande / contrái museu e chama home
	    toggle_museu = function(e) {
		// pega variaveis basicas
		var target = e.currentTarget,
		match = /^\w*_(\d*)$/.exec(target.id),
		nid = match[1],
		lang = ConfigFunctions.get_user_lang(),
		museu_ativo = $('body').data('museu_ativo'),
		museu_clicado = '#nid_' + nid + ' .subpages-container';

		// fix para nao deixar abrir nenhum outro museu quando um está abrindo
		if ($('body').data('animationRunning') == true) {
		    return false;
		}
		
		// toggle q abre/fecha museu
		_toggle_home_div(target, nid);
		if (museu_ativo != museu_clicado) {		
		    // inicializa museu internamente	
		    _init_museu(lang, nid);
		}
	    }
	    
	    _close_museu = function(target) {
		var nid = '',
		nav_fechar = '',
		el_onclick = '';

		nid = target.split(' ');
		nid = _.last(nid[0].split('_'));
		el_onclick = "#btnnid_" + nid;
		
		$(target).css('left', 0);
		// restaura estado do museu ativo
		$(target).animate(
		    { height: "0" },
		    { duration: $('body').data('config').transitionScrollDuration,
		      start: function() { 
			  $('body').data('animationRunning', true);
			  _toggle_click_button('off', el_onclick);
		      },
		      complete: function() {
			  $('body').data('animationRunning', false);
			  _toggle_click_button('on', el_onclick, toggle_museu);
		      }
		    }
		);
		
		// limpa museu anterior
		nav_fechar = "#nid_" + nid + " #navigation";
		// depois: verificar se tem diferenca entre nav_fechar e target
		$(nav_fechar).remove();
		$(target).html('');
		
		$('body').data('museu_ativo', '');
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
			    museu: museu.attributes[0],
			    mensagens: $('body').data('mensagens'),
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
		lang = lang || ConfigFunctions.get_user_lang(),
		dataMuseu = dataMuseu || defaultDataMuseu,
		el = "",
		el_off = '',
		el_div = '',
		el_onclick = '#btnnid_' + nid,
		el = "#nid_" + nid + " .subpages-container",
		tab_width = $('#nid_' + nid).width();
		//$('#nid_' + nid + ' .page').css('width', tab_width);		
		var compiledHomeTpl = _.template(MuseuHomeTpl, dataMuseu);
		// definir ativo
		$('body').data('museu_ativo', el);
		
		// aplica template renderizado
		$(el).html(compiledHomeTpl);
		
		if (dataMuseu == defaultDataMuseu) {
		    // carrega div ainda sem conteudo e anima deslocamento
		    $(el).animate(
			{ height: $('body').data('config').museuDivHeight},
			{ duration: $('body').data('config').transitionScrollDuration,
			  start: function() { 
			      $('body').data('animationRunning', true);
			      _toggle_click_button('off', el_onclick);
			  },
			  complete: function() {
			      $('body').data('animationRunning', false);
			      _toggle_click_button('on', el_onclick, toggle_museu);
			  }
			}
		    );
		} else {
		    // carrega conteudo dentro da div e anima fade in
		    el_div = el + " .page";
                    $(el_div).css('opacity', 1);
		}  
	    }
	    
	    //// _load_museu_tabs
	    // - carrega outras tabs/janelas
	    _load_museu_tabs = function(lang, nid, dataMuseu) {
		var tab_width = 0,
		total_width = 0,
		museu_tabs = [],
		el = '',
		compiledHomeTpl = '',
		compiledFotosTpl = '',
		compiledMapaTpl = '';
		
		// pega tamanho da tab aberta
		//tab_width = $('#nid_' + nid + ' .tabs-overflow').width();
		
		// TODO: adicionar evento: quando redimensionar, recalcula
		museu_tabs = ['#home_museu_' + nid, '#mapa_museu_' + nid, '#fotos_museu_' + nid];		
		var compiledMapaTpl = _.template(MuseuMapaTpl, dataMuseu);
		
		// so mostra tab de fotos se tiver imagens
		if (!_.isNull(dataMuseu.museu.imagens)) {
		    $.ajax({
			url: SiteConfig.baseUrl + "/museu_get_images/" + nid, 
			dataType: 'json', 
			success: function(imagens) {
			    dataMuseu.museu.imagens = imagens;
			    var compiledImagensTpl = _.template(MuseuImagensTpl, dataMuseu);	    
			    $(el).append(compiledImagensTpl);			    
			    $(el + ' .page').css('opacity', 1);
			    //$(el + ' .page').css('width', tab_width);
			}
		    });
		    
		} else {
		    museu_tabs.splice(1, 1);
		}
		
		$('body').data('museu_tabs', museu_tabs);
		$('body').data('museu_tab_ativo', museu_tabs[0]); // inicializa na home
		
		el = "#nid_" + nid + " .subpages-container";
		$(el).append(compiledMapaTpl);
		$(el + ' .page').css('opacity', 1);
		//$(el + ' .page').css('width', tab_width);
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
	    
	    // carrega museus - tela inicial
	    _load_museus = function(lang, tags, localizacao_str) {
		var tags = tags || 'todos',
		lang = lang || '',
		localizacao_str = localizacao_str || '',
		regioes = ['norte', 'nordeste', 'centro-oeste', 'sul', 'sudeste']; //TODO: centralizar isso em algum lugar, talvez drupal
		
		// armazena museu ativo
		$('body').data('museu_ativo', '');
		
		var museus = new MuseuCollection([]);
		museus.url += lang + '/' + tags;
		museus.lang = lang;
		museus.tags = tags;
		// se recebeu uma regiao (taxonomy parent) como parametro, mas tem q pegar ids para conseguir fazer a busca
		if (_.contains(regioes, localizacao_str)) { 
		    var localizacao = new LocalizacaoModel();		
		    
		    // chama url que retorna ids das cidades da regiao, para uso interno da url rest
		    localizacao.url +=  localizacao_str;
		    localizacao.fetch({
			success: function() {
			    cidades = localizacao.attributes;
			    var tids = [];
			    _.each(cidades, function(cidade) {
				tids.push(cidade.tid);
			    });
			    tid = tids.join(',');
			    museus.url += '/' + tids;
			    museus.fetch({
				success: function() {
				    _museu_parse_fetch(MuseuIndexTpl, museus, tags);
				}
			    });		
			}
		    });
		} else {
		    //  fetch comum, inclusive para cidades (recebeu ids)
		    if (localizacao_str != '') {
			museus.url += '/' + localizacao_str;
		    }
		    museus.fetch({
			success: function() {
			    _museu_parse_fetch(MuseuIndexTpl, museus, tags);
			}
		    });
		}		   		  
	    }

	    // da o parse do fetch dos museus
	    _museu_parse_fetch = function(MuseuIndexTpl, museus, tags) {
		var el_onclick = '',
		mensagem = '',
		nodes  = museus.models[0].attributes,
		data = {
		    nodes: nodes,
		    emptyMessage: $('body').data('mensagens').naoEncontrado
		}
		
		var compiledTemplate = _.template(MuseuIndexTpl, data);
		$('#content').html(compiledTemplate);
		$('#content').append("<div style='height: 200px'>&nbsp;</div>");
		$('#footer').html(_.template(FooterTpl));
		
		// bind click event && preload
		_.each(nodes, function(museu) {
		    el_onclick = '#btnnid_' + museu.nid;
		    _toggle_click_button('on', el_onclick, toggle_museu);
		    _preload_image(museu.foto_museu);
		});
		
		// seta tags (se houver)
		if (tags != '') {
		    //document.title = this.mensagens['portalMuseuBr'] + ' - ' + this.mensagens['exibindoMuseusDe'] + tags.toUpperCase();
		} else {
		    //document.title = this.mensagens['portalMuseuBr'];
		}
		
	    }
	    
	    // funcao para fazer preload de imagem
	    // - recebe caminho para imagem
	    _preload_image = function(imagemSrc) {
		var imagePreload = $('<img/>').attr('src', imagemSrc);
	    }
	    
	    // funcao para ligar / desligar botoes
	    // - state: on, off
	    _toggle_click_button = function(state, el, callback) {
		var state = state || false,
		el = el || false,
		callback = callback || false;
		
		if (state == 'on') {
		    $(el).css('cursor', 'pointer');
		    $(el).one('click', callback);		
		} else if (state == 'off') {
		    $(el).css('cursor', 'default');
		    $(el).off('click');
		}
	    }

	    // init main functionalities
	    _init_main = function(lang, tags, localizacao) {
		var tags = tags || 'todos',
		localizacao = localizacao || 'brasil';
		$('body').data('animationRunning', false);
		data = {
		    carregandoTags: '&nbsp;',
		    mensagens: $('body').data('mensagens'),
		    lang: $('body').data('userLang'),
		    regiao: 'brasil',
		    tags: tags
		}

		var compiledHeader = _.template(HeaderTpl, data);
		$('#header').html(compiledHeader, lang);
		$('#content').html("<div class='loading'></div>");
		
		_generate_header(tags, localizacao);
		_load_museus(lang, tags, localizacao);		
	    }
	    
	    // language check for sending to init_main
	    if (lang == '') {
		$.ajax({
		    url: "userlang.php", 
		    dataType: 'json', 
		    success: function(data) {
			lang = data.userLang;
			ConfigFunctions.set_user_lang(lang);
			$('#headerUrl').attr('href', '#'  + lang);
			_init_main(lang, tags, localizacao);
		    }
		});
	    } else {
		ConfigFunctions.set_user_lang(lang);
		_init_main(lang, tags, localizacao);
	    }
	    
	},
    });
    
    return IndexView;
});
