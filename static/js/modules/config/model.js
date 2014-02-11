define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var ConfigModel = Backbone.Model.extend({
	
	url: function() {
	    return '/museusbr/config';
	}	
    });
    
    return ConfigModel;
});