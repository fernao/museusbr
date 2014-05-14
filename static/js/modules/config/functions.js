define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/config/model',
], function($, _, Backbone, ConfigModel){
    return {
	initialize: function() {
	    this.loadConfig();
	},
	
	loadConfig: function() {
	    $('body').data('config', {});
	    
	    var config = new ConfigModel();
	    config.fetch({
		success: function() {
		    var configData = {};
		    configs = config.attributes;
		    _.each(configs, function(conf) {
			configData[conf.name] = conf.value
		    });
		    $('body').data('config', configData);
		    
		}
	    });
	}
    }
});