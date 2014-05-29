define([
    'jquery',
    'underscore',
    'backbone',
    'json!site-config.json'
], function($, _, Backbone, SiteConfig) {
    var MuseuModel = Backbone.Model.extend({
	idAttribute: 'nid',
	url: SiteConfig.baseUrl + '/museu/'
    });
    
    return MuseuModel;
});