define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/museu/model',
    'modules/museu/collection',
    'text!templates/header.html',
    'text!templates/museu/MuseuIndex.html'
], function($, _, Backbone, MuseuModel, MuseuCollection, Header, MuseuIndexTpl){
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
		_toggle_home_div(target);
		
		// inicializa museu internamente	
		_init_museu(nid);
		
	    }
	    
	    //// _init_museu
	    // - carrega varias informacoes do museu quando ele é clicado
	    // - inicia navegacao no museu particular
	    _init_museu = function(nid) {
		console.log("buscando museu " + nid);
		
		var museu = new MuseuModel({nid: nid});
		museu.fetch({
		    success: function() {
		    }
		});
	    }
	    
	    _toggle_home_div = function(el) {
		$(el).css('height', '200');
	    }
	    
	    

	    var compiledHeader = _.template(Header);
	    $('#header').html(compiledHeader);
	    
	    // get data from rest
	    var museus = new MuseuCollection([]);
	    museus.fetch({
		success: function() {
		    data = {
			nodes: museus.models[0].attributes
		    }
		    var compiledTemplate = _.template(MuseuIndexTpl, data);
		    $('#content').html(compiledTemplate);

		    $('div.museu-row').click(function(e) { toggle_museu(e) });
		}
	    });
	},
    });
    
    return IndexView;
});