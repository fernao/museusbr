define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/museu/model',
    'modules/museu/collection',
    'text!templates/header.html',
    'text!templates/museu/MuseuIndex.html'
], function($, _, Backbone, MuseuModel, MuseuCollection, Header, MuseuIndexTpl){
    var IndexView = Backbone.View.extend({
	
	render: function(){
	    var compiledHeader = _.template(Header);
	    $('#header').html(compiledHeader);
	    
	    // get data from rest
	    var museus = new MuseuCollection([]);
	    museus.fetch({
		success: function() {
		    data = {
			nodes: museus.models[0].attributes
		    }
		    var compiledTemplate = _.template(MuseuIndexTpl, data);
		    $('#content').html(compiledTemplate);
		}
	    });
	},
    });
    
    return IndexView;
});