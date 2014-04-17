define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var TagModel = Backbone.Model.extend({
	
	url: function() {
	    return '/museubr/tagcloud';
	}	
    });
    
    return TagModel;
});