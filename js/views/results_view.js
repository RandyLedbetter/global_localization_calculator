var ResultsView = Backbone.View.extend({

    initialize: function() {
       this.template = _.template(tpl.get('results_view'));

    },

    render: function() {

      glp.calculateYMatrix();

        $(this.el).html(this.template()).fadeIn(800);
        $('#content').empty().append(this.$el);
        $.playSound('audio/thankyou.mp3').delay(1000);
        glp.displayResults();
        return this;  
       
    }

});
