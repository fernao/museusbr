define([
    'jquery', 
    'underscore',
    'backbone',
    'tagcloud',
    'json!site-config.json',
    'modules/config/functions',
    'modules/museu/model',
    'modules/museu/collection',
    'modules/museu/functions',
    'modules/post/model',
    'modules/config/model',
    'modules/mensagens/model',
    'modules/tag/model',
    'modules/localizacao/model',
    'text!templates/museu/MuseuHome.html',
    'text!templates/header.html',
    'text!templates/footer.html',
    'text!templates/regiao.html',
    'text!templates/destaque.html',
    'text!templates/tags.html',
    'text!templates/botao-localizacao.html',
], function($, _, Backbone, TagCloud, SiteConfig, ConfigFunctions, MuseuModel, MuseuCollection, MuseuFunctions, PostModel, ConfigModel, MensagensModel, TagModel, LocalizacaoModel, MuseuHomeTpl, HeaderTpl, FooterTpl, RegiaoTpl, DestaqueTpl, TagsTpl, BotaoLocalizacaoTpl){
    var default_lang = '';
    var IndexView = Backbone.View.extend({
	
	render: function(lang, tags, localizacao, nid, pagina, subPagina, colecoes){
	    var lang = lang || '',
		tags = tags || '',
		localizacao = localizacao || '',
		nid = nid || '',
		pagina = pagina || 'index',
		subPagina = subPagina || '',
		colecoes = colecoes || '';
	    
	    /*
	     * definicao de funcoes
	     */
	    
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

	    _generate_header = function(tag, localizacao, pagina, subPagina, colecoes) {
		var tag = tag || 'todos',
		    localizacao = localizacao || 'brasil',
		    pagina = pagina || 'index',
		    subPagina = subPagina || '',
		    colecoes = colecoes || '',
		    lang = $('body').data('userLang'),
		    regioes = _get_regioes(),
		    localizacao_tids = '',
		    regiao = '',
		    is_cidade = false,
		    is_regiao = false;
		
		$('.museubr').click(function() {
		    Backbone.history.navigate('', true);
		});
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
				    var data = { 
					cidades: cidadesModel.attributes,
					regiao: regiao,
					localizacao_atual: localizacao,
					tags: tag,
					mensagens: $('body').data('mensagens'),
					lang: ConfigFunctions.get_user_lang(),
					regioes: _get_regioes(),
					pagina: pagina
				    }

				    if ($.isNumeric(localizacao)) {
					if(!_.isEmpty($('#localizacao-nome'))) {
					    var nomeCidadeAtual = '';
					    _.each(data.cidades, function(cidade){
						if (cidade.tid == localizacao) {
						    nomeCidadeAtual = cidade.name;
						}
					    });
					    $('#localizacao-nome').html(nomeCidadeAtual);
					}
				    }
				    
				    var compiledRegiao = _.template(RegiaoTpl, data);
				    $('#bloco-regiao').html(compiledRegiao);

				    // carrega botão de localizacao
				    var dataLocalizacao = {
					tag: tag,
					lang: lang,
					cidade: _.findWhere(data.cidades, {tid: localizacao})
				    }
				    $('#botoes-termos').prepend(_.template(BotaoLocalizacaoTpl, dataLocalizacao));
				}
			    });
			    
			} else if (is_regiao || localizacao == 'brasil') {
			    var dataCidades = { 
				cidades: localizacaoModel.attributes,
				regiao: regiao,
				localizacao_atual: localizacao,
				tags: tag,
				mensagens: $('body').data('mensagens'),
				lang: ConfigFunctions.get_user_lang(),
				regioes: _get_regioes(),
				pagina: pagina
			    }
			    
			    var compiledRegiao = _.template(RegiaoTpl, dataCidades);
			    $('#bloco-regiao').html(compiledRegiao);
			    
			}
			
			// TAGS
			// localizacao passada deve ser um tid
			tags.url = SiteConfig.baseUrl + '/tagcloud/' + lang + '/' + localizacao_tids;
			tags.fetch({
			    success: function() {
				var dataTags = {
				    tags: tags.attributes,
				    tag: tag,
				    mensagens: $('body').data('mensagens'),
				    localizacao: localizacao,
				    lang: lang,
				    pagina: pagina
				}
				var compiledTags = _.template(TagsTpl, dataTags);
				$('#tag_cloud').html(compiledTags);
				
				$.fn.tagcloud.defaults = {
				    size: {start: 14, end: 20, unit: 'pt'},
				    color: {start: '#fada53', end: '#fada53'}
				};

				
				$(function () {
				    $('#tag_cloud a').tagcloud();

				    MuseuFunctions.carregaMenu();

				    switch (pagina) {
				    case 'index':
					$('#ver-todos').click(function() {
					    Backbone.history.navigate(lang + '/diretorio/' + tag + '/' + localizacao, {trigger: true});				    
					});
					break;
				    case 'diretorio':
					$('#mostrar-mais').click(function() {
					    _mostrar_mais(5);
					    //_load_museus(data.lang, data.tags, data.localizacao, data.nid, 5, 0);
					});
					break;
				    }
				});
			    }
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
		    nid = match[1],
		    lang = ConfigFunctions.get_user_lang();

		data.museu_ativo = $('body').data('museu_ativo');
		data.museu_clicado = '#nid_content_' + nid + ' .subpages-container';
		
		// fix para nao deixar abrir nenhum outro museu quando um está abrindo
		if ($('body').data('animationRunning') == true) {
		    return false;
		}
		
		// toggle q abre/fecha museu
		_toggle_home_div(target, nid);
		if (data.museu_ativo != data.museu_clicado) {		
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
		el_onclick = "#nid_" + nid;
		
		$(target).removeClass('aberto_1');
		
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
		nav_fechar = "#nid_content_" + nid + " #navigation";
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
		_load_museu_home(lang, nid, null, true);
		
		var museu = new MuseuModel({nid: nid});
		museu.url += lang + '/' + nid;
		museu.fetch({
		    success: function() {
			var dataMuseu = {
			    museu: museu.attributes[0],
			    mensagens: $('body').data('mensagens'),
			}
			_load_museu_home(lang, nid, dataMuseu);
		    }
		});
	    }
	    
	    //// _load_museu_home
	    // - carrega home do museu
	    _load_museu_home = function(lang, nid, dataMuseu, vazio) {
		var defaultDataMuseu = {museu: { nid: nid} },
		    lang = lang || ConfigFunctions.get_user_lang(),
		    dataMuseu = dataMuseu || defaultDataMuseu,
		    vazio = vazio || false;
		    el = "",
		    el_off = '',
		    el_div = '',
		    el_onclick = '#nid_' + nid,
		    el = "#nid_content_" + nid + " .subpages-container",
		    tab_width = $('#nid_' + nid).width(),
		    tab_height = 0;

		var compiledHomeTpl = _.template(MuseuHomeTpl, dataMuseu);
		// definir ativo
		$('body').data('museu_ativo', el);
		
		// slideshow
		slideIndex = 1;
		
		plusSlides = function(n) {
			showSlides(slideIndex += n);
		}
		
		currentSlide = function(n) {
		    showSlides(slideIndex = n);
		}
		
		showSlides = function(n) {
		    var i;
		    var slides = document.getElementsByClassName("mySlides");
		    var dots = document.getElementsByClassName("dot");
		    if (n > slides.length) {slideIndex = 1}
		    if (n < 1) {slideIndex = slides.length}
		    for (i = 0; i < slides.length; i++) {
			slides[i].style.display = "none";
		    }
		    for (i = 0; i < dots.length; i++) {
			dots[i].className = dots[i].className.replace(" active", "");
		    }
		    slides[slideIndex-1].style.display = "block";
		    dots[slideIndex-1].className += " active";
		}
		
		
		// aplica template renderizado
		$(el).html(compiledHomeTpl);
		
		// nao entra caso seja init vazio
		if (!vazio) {
		    $.ajax({
			url: SiteConfig.baseUrl + "/museu_get_images/" + nid, 
			dataType: 'json', 
			success: function(imagens) {
			    dataMuseu.museu.imagens = imagens;
			    ConfigFunctions.getTemplateManager('templates/museu/SlideshowNavigation', function(SlideshowNavigationTpl) {		
				var compiledNavigationTpl = _.template(SlideshowNavigationTpl, dataMuseu);
				
				ConfigFunctions.getTemplateManager('templates/museu/ImagensSlideshow', function(ImagensSlideshowTpl) {		
				    var compiledImagensTpl = _.template(ImagensSlideshowTpl, dataMuseu);	    
				    
				    $('#slideshow_' + nid).html(compiledImagensTpl + compiledNavigationTpl);
				    slideIndex = 1;
				    showSlides(slideIndex);
				    
				    $(el + ' .page').css('opacity', 1);
				});
			    });
			}
		    });
		}
		
		tab_height = $('#subpages_' + nid).height();
		
		if (dataMuseu == defaultDataMuseu) {
		    
		    // move scroll para local
		    // - subtraido tamanho do box do titulo
		    // - se tem museu aberto, executar somente quando o outro terminar <----
		    var topoAntigo = (data.museu_ativo != "") ? $(data.museu_ativo.split(' .subpages-container')[0]).offset().top : 0,
			topoNovo = $("#nid_" + nid).offset().top,
			ajusteScroll = 0;
		    
		    if ((topoAntigo !== 0) && (topoAntigo < topoNovo)) {
			ajusteScroll = - $(data.museu_ativo).height();
		    }
		    
		    $('html,body').animate({
			scrollTop: $("#nid_" + nid).offset().top + ajusteScroll
		    });
		    
		    // carrega div ainda sem conteudo e anima deslocamento
		    $(el).animate(
			{ height: $('body').data('config').museuDivHeight},  // TODO: tirar essa definição manual e colocar flexível
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
		    $(el_div).addClass('aberto_1');
		}
	    }

	    
	    /*
	     * abre novo museu
	     */
	    _toggle_home_div = function(el, nid) {
		var museu_ativo = '';		
		
		if ($('body').data('museu_ativo') != '') {
		    museu_ativo = $('body').data('museu_ativo');
		    _close_museu(museu_ativo);
		} else {
		    // define novo museu aberto
		    $('body').data('museu_ativo', '#nid_content_' + nid + " .subpages-container");		    
		}
	    }

	    _load_destaques = function(lang) {
		var lang = lang || '',
		    post = new PostModel();

		post.url = SiteConfig.baseUrl + '/destaques/' + lang;
		post.fetch({
		    success: function(data) {
			var data = {
			    posts: data.attributes
			}
			
			if (Object.keys(data.posts).length > 0) {
			    var compiledTemplateDestaque = _.template(DestaqueTpl, data);
			    $('#espaco-header .espaco-imagem').html(compiledTemplateDestaque);
			}
		    }
		});
	    }
		
	    
	    // carrega conteúdo posts
	    _load_posts = function(lang, subPagina) {
		var lang = lang || 'pt-br',
		    subPagina = subPagina || '',
		    post = new PostModel();
		
		ConfigFunctions.getTemplateManager('templates/blog', function(BlogTpl) {
		    // blog
                    var postMemoria = new PostModel();
		    postMemoria.url = SiteConfig.baseUrl + '/posts/' + lang + '/memória';
		    postMemoria.fetch({
			success: function(dataMemoria) {
			    var dataMemoria = {
				posts: dataMemoria.attributes,
				mensagens: $('body').data('mensagens')
			    }
			    var compiledTemplateMemoria = _.template(BlogTpl, dataMemoria);
			    var postRoteiros = new PostModel();
                            postRoteiros.url = SiteConfig.baseUrl + '/posts/' + lang + '/roteiros';
			    postRoteiros.fetch({
				success: function(dataRoteiros) {
				    var dataRoteiros = {
					posts: dataRoteiros.attributes,
					mensagens: $('body').data('mensagens')
				    }
				    var compiledTemplateRoteiros = _.template(BlogTpl, dataRoteiros);

				    var postNoticias = new PostModel();
				    postNoticias.url = SiteConfig.baseUrl + '/posts/' + lang + '/noticias';
				    postNoticias.fetch({
					success: function(dataNoticias) {
					    var dataNoticias = {
						posts: dataNoticias.attributes,
						mensagens: $('body').data('mensagens')
					    }
					    					    
					    var compiledTemplateNoticias = _.template(BlogTpl, dataNoticias);

					    var postBlog = new PostModel();
					    postBlog.url = SiteConfig.baseUrl + '/posts/' + lang + '/blog';
					    postBlog.fetch({
						success: function(dataBlog) {
						    var dataBlog = {
							posts: dataBlog.attributes,
							mensagens: $('body').data('mensagens')
						    }
					    	    
						    var compiledTemplateBlog = _.template(BlogTpl, dataBlog);

						    
						    $('#blog-content').append(compiledTemplateNoticias);
						    $('#blog-content').append(compiledTemplateRoteiros);
						    $('#blog-content').append(compiledTemplateMemoria);
						    
						    // hack para conseguir "abrir links" de hashs vindo de outras páginas sem conflitar com backbone
						    if (subPagina !== '') {
							var secaoRolar = subPagina.split('#')[1];
							MuseuFunctions.rolarSecao('#bloco-' + secaoRolar);
						    }
						}
					    });
					}
				    });
				}
			    });
			    
			}
		    });

		    ConfigFunctions.getTemplateManager('templates/dicas', function(DicasTpl) {
			// blog
			post.url = SiteConfig.baseUrl + '/dicas/' + lang;
			post.fetch({
			    success: function(dataDicas) {
				var dataDicas = {
				    posts: dataDicas.attributes,
				    mensagens: $('body').data('mensagens')
				}
				
				var compiledTemplateDicas = _.template(DicasTpl, dataDicas);			    
				$('#dicas-content').append(compiledTemplateDicas);
			    }
			});
		    });
			
		    // inicia com nada ?
		    $('#news-content').html();
		    $('#blog-content').html();
		});
	    }

	    // exibe mais museus já caregdos
	    _mostrar_mais = function(qtd) {
		var qtd = qtd || 5,
		    localData = {};
		//
		//data.qtdMuseusExibindo = 5;
		localData.nodes = _.toArray(data.museus).slice(data.qtdMuseusExibindo, data.qtdMuseusExibindo + qtd);
		ConfigFunctions.getTemplateManager('templates/museu/MuseuIndex', function(MuseuIndexTpl) {
		    var compiledTemplate = _.template(MuseuIndexTpl, localData);
		    $('#museus-content').append(compiledTemplate);
		    
		    // bind click event && preload
		    _.each(localData.nodes, function(museu) {
			el_onclick = '#nid_' + museu.nid;
			_toggle_click_button('on', el_onclick, toggle_museu);
			_preload_image(museu.foto_museu);
		    });
		    data.qtdMuseusExibindo += qtd;

		    if (data.qtdMuseusExibindo >= data.totalMuseus) {
			$('#mostrar-mais').hide();
		    }
		});
	    }
	    
	    
	    // carrega museus - tela inicial
	    _load_museus = function(lang, tags, localizacao_str, nid, limit, colecoes) {
		var tags = tags || 'todos',
		    lang = lang || '',
		    localizacao_str = localizacao_str || '',
		    nid = nid || '',
		    limit = limit || 0,
		    colecoes = colecoes || '',
		    regioes = ['norte', 'nordeste', 'centro-oeste', 'sul', 'sudeste']; //TODO: centralizar isso em algum lugar, talvez drupal
		
		// armazena museu ativo
		$('body').data('museu_ativo', '');

		var museus = new MuseuCollection([]);

		if (nid != '') {
		    museus.url = SiteConfig.baseUrl + '/museu_individual/' + lang + '/' + nid;
		    localizacao_str = '';
		} else {
		    museus.url += lang + '/' + tags;
		    museus.lang = lang;
		    museus.tags = tags;
		}
		
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
				    _museu_parse_fetch(museus, tags, '', limit);

				    var totalMuseus = Object.keys(museus.models[0].attributes).length,
					mensagem = '';

				    data.museus = museus.models[0].attributes;
				    data.totalMuseus = totalMuseus;

				    if (totalMuseus > 1) {
					mensagem = totalMuseus + ' museus';
				    } else if (totalMuseus === 1) {
					mensagem = totalMuseus + ' museu';
				    } else {
					mensagem = 'Nenhum museu';
				    }
				    $('#num-museus').html(mensagem);
				}
			    });		
			}
		    });
		} else {
		    //  fetch comum, inclusive para cidades (recebeu ids)
		    if (localizacao_str != '') {
			museus.url += '/' + localizacao_str;
			if (colecoes != '') {
			    museus.url += '/' + colecoes;
			}
		    }
		    museus.fetch({
			success: function() {
			    _museu_parse_fetch(museus, tags, nid, limit);
			    data.museus = museus.models[0].attributes;
			    
			    var totalMuseus = Object.keys(museus.models[0].attributes).length,
				mensagem = '';
			    data.totalMuseus = totalMuseus;
			    
			    if (totalMuseus > 1) {
				mensagem = totalMuseus + ' museus';
			    } else if (totalMuseus === 1) {
				mensagem = totalMuseus + ' museu';
			    } else {
				mensagem = 'Nenhum museu';
			    }
			    $('#num-museus').html(mensagem);
			}
		    });
		}  		  
	    }

	    // da o parse do fetch dos museus
	    _museu_parse_fetch = function(museus, tags, nid, limit) {
		var museus = museus || '',
		    tags = tags || '',
		    nid = nid || '',
		    limit = limit || 0,
		    
		    el_onclick = '',
		    mensagem = '',
		    nodes = museus.models[0].attributes,
		    localData = {
			nodes: nodes,
			emptyMessage: $('body').data('mensagens').naoEncontrado
		    }

		// inicializa contagem de museus na tela
		if (typeof data.countMuseus === 'undefined') {
		    data.countMuseus = 0;
		}
		
		// se for passado um limite, incrementa
		if (limit > 0) {
		    var nodeCounter = 0,
			slicedNodes = {},
			n = 0;
		    
		    _.each(nodes, function(node) {
			n++;
			// caso ja existam museus, anda até o fim da pilha atual
			if (data.countMuseus > 0) {
			    if (n > data.countMuseus) {
				// adiciona museus enquanto não atinge o limite
				if (nodeCounter < limit) {
				    slicedNodes[nodeCounter] = node;
				    nodeCounter ++;
				}
			    }
			} else {
			    // adiciona museus enquanto não atinge o limite
			    if (nodeCounter < limit + data.countMuseus) {
				slicedNodes[nodeCounter] = node;
				nodeCounter ++;
			    }
			}
		    });
		    localData.nodes = slicedNodes;
		    data.countMuseus = nodeCounter;
		}

		ConfigFunctions.getTemplateManager('templates/museu/MuseuIndex', function(MuseuIndexTpl) {
		    var compiledTemplate = _.template(MuseuIndexTpl, localData);
		    if (data.countMuseus > 0) {
			$('#museus-content').append(compiledTemplate);
		    } else {
			$('#museus-content').html(compiledTemplate);
		    }
		    
		    // bind click event && preload
		    _.each(nodes, function(museu) {
			el_onclick = '#nid_' + museu.nid;
			_toggle_click_button('on', el_onclick, toggle_museu);
			_preload_image(museu.foto_museu);
		    });

		    // se tiver alcançado o maximo de museus, esconde botão de carregar mais
		    if (Object.keys(nodes).length == nodeCounter) {
			$('#mostrar-mais').hide();
		    }

		    // se for busca por nid
		    if (nid) {
			$('#nid_' + nid).click();
		    }
		    
		});		
	    }
	    
	    // funcao para fazer preload de imagem
	    // - recebe caminho para imagem
	    _preload_image = function(imagemSrc) {
		var imagePreload = $('<img/>').attr('src', imagemSrc);
	    }
	    
	    // funcao para ligar / desligar botoes dos museus
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
	    _init_main = function(lang, tags, localizacao, nid, pagina, subPagina, colecoes) {
		var tags = tags || 'todos',
		    localizacao = localizacao || 'brasil',
		    nid = nid || '',
		    pagina = pagina || 'index',
		    subPagina = subPagina || '',
		    colecoes = colecoes || '';
		$('body').data('animationRunning', false);
		data = {
		    carregandoTags: '&nbsp;',
		    mensagens: $('body').data('mensagens'),
		    lang: $('body').data('userLang'),
		    regiao: 'brasil',
		    localizacao: localizacao,
		    tags: tags,
		    nid: nid,
		    colecoes: colecoes
		}
		var compiledHeader = _.template(HeaderTpl, data);
		
		switch (pagina) {
		case 'index':

		    ConfigFunctions.getTemplateManager('templates/home', function(HomeTpl) {
			var compiledHome = _.template(HomeTpl, data);
			$('#header').html(compiledHeader, lang);
			$('#bloco-conteudo').html(compiledHome, lang);

			if (tags.search('#') > -1) {
			    tags = 'todos';
			}
			
			_generate_header(tags, localizacao, pagina, subPagina, colecoes);
			_load_destaques(lang);
			_load_posts(lang, subPagina);
			if (tags != 'todos' || localizacao != 'brasil' || colecoes != '') {
			    _load_museus(lang, tags, localizacao, nid, 5, colecoes);
			}
		    });
		    
		    break;
		case 'diretorio':

		    ConfigFunctions.getTemplateManager('templates/diretorio', function(DiretorioTpl) {
			var compiledDiretorio = _.template(DiretorioTpl, data);
			$('#header').html(compiledHeader, lang);
			$('#espaco-header').hide();
			$('#bloco-conteudo').html(compiledDiretorio, lang);
			
			_generate_header(tags, localizacao, pagina);
			_load_museus(lang, tags, localizacao, nid, 5);
			data.qtdMuseusExibindo = 5;
		    });
		    break;

		case 'museu':

		    ConfigFunctions.getTemplateManager('templates/diretorio', function(DiretorioTpl) {
			var compiledDiretorio = _.template(DiretorioTpl, data);
			$('#header').html(compiledHeader, lang);
			$('#bloco-conteudo').html(compiledDiretorio, lang);
			
			_generate_header(tags, localizacao, pagina);
			_load_museus(lang, tags, localizacao, nid, 1);
		    });
		    
		}

		$('#footer').html(_.template(FooterTpl));
		
	    }
	    
	    
	    /*
	     * inicialização
	     */
	    
	    // language check for sending to init_main
	    if (lang == '') {
		$.ajax({
		    url: "userlang.php", 
		    dataType: 'json', 
		    success: function(data) {
			museubr = {};
			lang = data.userLang;
			ConfigFunctions.set_user_lang(lang);
			$('#headerUrl').attr('href', '#'  + lang);
			_init_main(lang, tags, localizacao, nid, pagina, subPagina, colecoes);
		    }
		});
	    } else {
		ConfigFunctions.set_user_lang(lang);
		_init_main(lang, tags, localizacao, nid, pagina, subPagina, colecoes);
	    }
	    
	},
    });
    
    return IndexView;
});
