define([
    'jquery',
    'underscore',
    'backbone',
    'json!site-config.json'
], function($, _, Backbone, SiteConfig) {
    var LocalizacaoModel = Backbone.Model.extend({	
	url: SiteConfig.baseUrl + '/localizacao/'
    });
    
    return LocalizacaoModel;
});