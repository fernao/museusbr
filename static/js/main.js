// funcao main, usa require
// mapeia libs usadas, a serem chamadas pelo require

require.config({
    shin: {
	underscore: { 
	    exports: '_'
	},
	backbone: {
	    deps: ['underscore', 'jquery'],
	    exports: 'Backbone'
	}
    },
    paths: {
	jquery: 'lib/jquery',
	underscore: 'lib/underscore',
	backbone: 'lib/backbone',
	templates: '../templates',
        json: 'lib/require/json',
        text: 'lib/require/text',
    },
    waitSeconds: 200
});

require([
    'jquery', 'underscore', 'backbone', 'app'
], function($, _, Backbone, App){
    App.initialize();
});