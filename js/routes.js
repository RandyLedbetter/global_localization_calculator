var AppRouter = Backbone.Router.extend({

    routes:{
        "rfyView":"rfyView",
        "oyzView":"oyzView",
        "resultsView":"resultsView"
    },

    rfyView: function () {

       if(glp.get('animationType')) {

            $('#content').html(new RFYView({model: glp}).renderAutomatic());
            console.log('RFYView with renderAutomatic() called in routes.js');

        } else {

            $('#content').html(new RFYView({model: glp}).renderManual());
            console.log('RFYView with renderManual() called in routes.js');
        }
        	    	
	},

    oyzView: function () {
        
        if(glp.get('animationType')) {

            $('#content').html(new OYZView({model: glp}).renderAutomatic());
            console.log('OYZView with renderAutomatic() called in routes.js');

        } else {

            $('#content').html(new OYZView({model: glp}).renderManual());
            console.log('OYZView with renderManual() called in routes.js');
        }
      
            
    },

    resultsView: function () {

            $('#content').html(new ResultsView({model: glp}).render().el);
            console.log('resultsView with render() called in routes.js');
        
    }

});

tpl.loadTemplates(['rfy_view', 'oyz_view', 'results_view'], function () {
    app = new AppRouter();
    Backbone.history.start();
});
