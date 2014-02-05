define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MuseuModel = Backbone.Model.extend({
	idAttribute: 'nid'
    });
    
    return MuseuModel;
});