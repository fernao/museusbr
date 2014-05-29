define([
    'jquery',
    'underscore',
    'backbone',
    'json!site-config.json'
], function($, _, Backbone, SiteConfig) {
    var MensagensModel = Backbone.Model.extend({	
	url: SiteConfig.baseUrl + '/mensagens/'
    });
    
    return MensagensModel;
});