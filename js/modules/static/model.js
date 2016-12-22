define([
    'jquery',
    'underscore',
    'backbone',
    'json!site-config.json'
], function($, _, Backbone, SiteConfig) {
    var StaticModel = Backbone.Model.extend({
	idAttribute: 'nid',
	url: SiteConfig.baseUrl + '/static/'
    });
    
    return StaticModel;
});
