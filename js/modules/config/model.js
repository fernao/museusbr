define([
    'jquery',
    'underscore',
    'backbone',
    'json!site-config.json'
], function($, _, Backbone, SiteConfig) {
    var ConfigModel = Backbone.Model.extend({
	url: function() {
	    return SiteConfig.baseUrl + '/config';
	}	
    });
    
    return ConfigModel;
});