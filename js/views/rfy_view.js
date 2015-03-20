var RFYView = Backbone.View.extend({

  initialize: function() {
       this.template = _.template(tpl.get('rfy_view'));

    },

    events: {
      "click #continue-btn": "continue"
    },

    continue: function() {
          
            app.navigate('oyzView', {trigger: true});
            return this;        
      
    },

    renderManual: function() {
        glp.calculateYMatrix();

        $(this.el).html(this.template()).fadeIn(800);
        $('#content').empty().append(this.$el);     
       
    },

    renderAutomatic: function() {
        glp.calculateYMatrix();

        $(this.el).html(this.template()).fadeIn(800);
        $('#content').empty().append(this.$el);

        window.setTimeout(function() {
            //alert('stop');
            app.navigate('oyzView', {trigger: true});
            return this; 

          }, glp.get('animationSpeed'));     
       
    }

});
