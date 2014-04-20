define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MuseuModel = Backbone.Model.extend({
	idAttribute: 'nid',
	url: '/museubr/museu/'
/*	url: function() {
	    return '/museubr/museu/' + this.id;
	}*/
    });
    
    return MuseuModel;
});