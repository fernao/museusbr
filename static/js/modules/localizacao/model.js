define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var LocalizacaoModel = Backbone.Model.extend({
	url: '/museubr/localizacao/'
    });
    
    return LocalizacaoModel;
});