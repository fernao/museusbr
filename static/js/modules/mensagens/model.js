define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MensagensModel = Backbone.Model.extend({
	
	url: '/museubr/mensagens/'
    });
    
    return MensagensModel;
});