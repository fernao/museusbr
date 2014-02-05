define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {
    var MuseuModel = Backbone.Model.extend({
	idAttribute: 'nid',
	
	url: function() {
	    return '/museusbr/museu/' + this.id;
	}
    });
    
    return MuseuModel;
});