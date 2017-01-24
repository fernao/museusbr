define([
    'jquery', 
    'underscore',
    'backbone',
    'modules/config/model',
    'json!site-config.json',
], function($, _, Backbone, ConfigModel, SiteConfig){

    /**                                                                                                                                                                        
     * render common elements for internal pages
     * Idea taken from: https://lostechies.com/derickbailey/2012/02/09/asynchronously-load-html-templates-for-backbone-views/
     * Totally readapted by Fernão Lopes Ginez de Lara 2016
     *
     * @templateName {String} HTML template page name (without .html)
     * @callback {Function} Callback in order to run
     * @return {None}
     */
    var getTemplateManager = function(templateName, callback){
	// defines new global variable for templates, if not set
	if (typeof configs === 'undefined') {
	    configs = {};
	}
	
	if (typeof configs.templates === 'undefined') {
	    configs.templates = {};
	}

	var templateString = templateName.replace(/\//gi, '_'),
	    templateInstance = configs.templates.hasOwnProperty[templateString];
	
	// already loaded: runs it
	if (typeof templateInstance !== 'undefined') {
	    callback(templateInstance);
	} else {

	    // not yet loaded: get it
	    $.get(SiteConfig.baseInterface + templateName + '.html', function(templateContent) {
		if (typeof configs.templates === 'undefined') {
		    configs.templates = {};
		}
		// adds to loaded list
		configs.templates[templateName.replace(/\//gi, '_')] = templateContent;

		callback(templateContent);
	    });
	}
    }
    
    
    return {
	initialize: function() {
	    this.loadConfig();
	},
	
	getTemplateManager: getTemplateManager,
	
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
	},
	
	//// get_default_lang
	// - pega lang default do usuario
	get_user_lang: function() {
	    lang = $('body').data('userLang');
	    return lang;
	},

	set_user_lang: function(lang) {
	    $('body').data('userLang', lang);
	}
    }
});
