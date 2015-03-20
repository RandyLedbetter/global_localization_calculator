var OYZView = Backbone.View.extend({

    initialize: function() {
       this.template = _.template(tpl.get('oyz_view'));

    },

    events: {
      "click #continue-btn": "continue"
    },

    continue: function() {

          if(glp.get('count') < glp.get('t') && glp.fMatrixIsNotUnique()) {

            app.navigate('#rfyView', {trigger: true});
            return this; 

        } else {

            console.log('glp.count = ' + glp.get('count') + ' - ' + 'glp.t = ' + glp.get('t'));

            app.navigate('#resultsView', {trigger: true});
            return this;
                    
        }
      
    },

    renderManual: function() {

       var array = glp.get('sensoryInput');
       glp.calculateDiscrepencies(array[glp.get('count')]);
       glp.makeOMatrix();
       glp.makeZMatrix();
       glp.calculateNormalizationSum();
       glp.updateFMatrix();
       glp.getFMaximum();
       glp.getFMinimum();
      

      $(this.el).html(this.template()).fadeIn(800);
      $('#content').empty().append(this.$el);


      glp.set('count', glp.get('count') + 1);
                         
    },

    renderAutomatic: function() {

       var array = glp.get('sensoryInput');
       glp.calculateDiscrepencies(array[glp.get('count')]);
       glp.makeOMatrix();
       glp.makeZMatrix();
       glp.calculateNormalizationSum();
       glp.updateFMatrix();
       glp.getFMaximum();
       glp.getFMinimum();
       

        $(this.el).html(this.template()).fadeIn(800);
        $('#content').empty().append(this.$el);

        glp.set('count', glp.get('count') + 1);

        if(glp.get('count') < glp.get('t')) {
        window.setTimeout(function() {
        app.navigate('#rfyView', {trigger: true});
        return this; 

        }, glp.get('animationSpeed'));


        } else {
          
          window.setTimeout(function() {
            app.navigate('#resultsView', {trigger: true});
            return this;
          }, glp.get('animationSpeed'));
          

        }          
    }
});
