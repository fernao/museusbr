define([
    'jquery', 
    'underscore',
    'backbone',
    'json!site-config.json',
    'modules/config/functions',
    'modules/static/model',
    'text!templates/header.html',
    'text!templates/footer.html',
], function($, _, Backbone, SiteConfig, ConfigFunctions, StaticModel, HeaderTpl, FooterTpl){
    var SobreView = Backbone.View.extend({
	
	render: function(lang){
	    var pointer = setInterval(function() {	
		if (!_.isEmpty($('body').data('mensagens'))) {
		    data = {
			carregandoTags: '&nbsp;',
			mensagens: $('body').data('mensagens'),
			lang: $('body').data('userLang'),
		    }
		    $('body').removeClass();
		    $('body').addClass('page-sobre');
		    var compiledHeader = _.template(HeaderTpl, data);
		    $('#header').html(compiledHeader, lang);
		    $('.espaco-imagem').css('height', '20vmax');

		    ConfigFunctions.getTemplateManager('/templates/sobre', function(SobreTpl) {
			var compiledTemplate = _.template(SobreTpl, data);
			$('#bloco-conteudo').html(compiledTemplate);
			$('#bloco-conteudo').append("<div style='height: 100px'>&nbsp;</div>");
			
			$('#footer').html(_.template(FooterTpl));
			
			_.each($('.menu-sobre'), function(item) {
			    $(item).click(function(){
				var nome = $(item).attr('id').split('sobre_')[1],
				    currOffset = $('#sobre_link').offset(),
				    alturaEl = $('#' + nome + '_link').offset(),
				    diffAltura = alturaEl.top - currOffset.top;
				
				$('#flutuante-sobre').css({
				    'position': 'relative',
				    'top': diffAltura + 'px'
				});
				window.scroll(alturaEl);
			    });
			});
			
			var paginasSobre = ['sobre', 'direitos', 'institutobrasiliana', 'equipe', 'contato'];
			$(window).on('scroll', function() {
			    var currentY = $(this).scrollTop(),
				currOffset = $('#sobre_link').offset(),
				diffAltura = currentY - currOffset.top;
			    
			    if (currentY > currOffset.top) {
				$('#flutuante-sobre').css({
				    'position': 'relative',
				    'top': diffAltura + 'px'
				});
			    }
			});
			
			_.each(paginasSobre, function(nomePagina) {
			    var pagina = new StaticModel();
			    pagina.url = SiteConfig.baseUrl + '/paginas/' + lang + '/' + nomePagina;
			    pagina.fetch({
				success: function(data) {
				    var conteudo = data.attributes[0];
				    $('#' + nomePagina + ' .conteudo').html(conteudo.corpo);
				}
			    });
			});			
		    });
			
		    clearInterval(pointer);
		}
	    }, 50);
	}
    });
    return SobreView;
});
