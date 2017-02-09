define([
    'jquery',
    'underscore',
    'backbone',
    'json!site-config.json'
], function($, _, Backbone, SiteConfig) {
    var PostModel = Backbone.Model.extend({
	idAttribute: 'nid',
	url: SiteConfig.baseUrl + '/posts/'
    });
    
    return PostModel;
});
