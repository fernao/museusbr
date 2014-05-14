define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/mensagens/model',
], function($, _, Backbone, MensagensModel){
    return {
	initialize: function() {
	    this.loadMensagens();
	},
	
	loadMensagens: function(lang) {
	    $('body').data('mensagens', {});
	    
	    var mensagens = new MensagensModel();
	    mensagens.url += lang;
	    mensagens.fetch({
		success: function() {
		    var mensagensData = {};		    
		    msgs = mensagens.attributes;
		    _.each(msgs, function(msg) {
			mensagensData[msg.name] = msg.value
		    });
		    $('body').data('mensagens', mensagensData);		    
		}
	    });
	}
    }
});