define([
    'jquery',
    'underscore',
    'backbone',
    'modules/museu/model',
    'json!site-config.json'
], function($, _, Backbone, MuseuModel, SiteConfig){
    var MuseuCollection = Backbone.Collection.extend({
	model: MuseuModel,
	url: SiteConfig.baseUrl + '/museus/',
    });
    return MuseuCollection;
});