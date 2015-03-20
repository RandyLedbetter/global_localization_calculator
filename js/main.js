/*
 * Filename: main.js
 * Author: Randy Michael Ledbetter
 * Date: 9/27/13
 * Time: 12:27 PM
 
 * Description: This is the main JavaScript file containing core processing
 *              scripts for the SAP Global Localization Calculator.
*/




window.template = function(id) {
    return _.template( $('#' + id).html() );
};

var GLP = Backbone.Model.extend({
    defaults: {
        d0: 0.6561,
        d1: 0.0729,
        d2: 0.0081,
        d3: 0.0009,
        d4: 0.0001,
        sensoryInput: [],
        discrepencies: [],
        gridMap: undefined,
        errorProbabilities: [0.6561, 0.0729, 0.0081, 0.0009, 0.0001],
        F: undefined,
        Q: undefined,
        R: undefined,
        O: undefined,
        Y: undefined,
        Z: undefined,
        normalizationSum: 0,
        t: 0,
        n: 13,
        count: 0,
        animationType: false,
        animationSpeed: 5000,
        maxCount: 0
    },

    

    processSensoryInput: function(formInput) {

        // Remove whitespace and convert formInput into Array of Strings
        var inputs = formInput.toString().replace(/\s/g, '').split(',');

        // If not an empty string, proceed
        if(inputs.toString() != '') {

            var i, j, k;

            for(i = 0; i < inputs.length; i++) {

                // Split each string representing directions into an array
                var directions = inputs[i].split('').sort();

                // Validate the input for correct format and no duplication
                for(j = 0; j < directions.length; j++) {
                    var d = directions[j].toUpperCase();

                    if(d != 'N' && d != 'S' && d != 'W' && d != 'E') {
                        return false;
                    }

                    for(k = 0; k < directions.length; k++) {
                        if(directions[k+1] == directions[k]) {
                            return false;
                        }
                    }
                }

                // Store parsed string into the sensoryInput array
                if(inputs[i] == '') {
                    return false;
                } 

            }

            return true;

        } else {

            return false;

        }
    },

    makeRMatrix: function() {
        var rArray = [];
        var temp = [];

        for (var r = 0; r < gridMap.length; r++) {
            for (var c = 0; c < gridMap.length; c++) {
                var prob = 0;

                if (gridMap.at(c).get('adjPaths').indexOf(r + 1) != -1) {

                    prob = 1 / gridMap.at(c).get('adjPaths').length;
                }

                temp[c] = prob; 
            
            }

            rArray[r] = temp;
            temp = [];
        }

        var rMatrix = Matrix.create(rArray);
        this.set('R', rMatrix);

        return rMatrix;


    },

    makeFMatrix: function() {
        var fArray = [];

        for(var i = 0;i < this.get('n'); i++) {
            fArray[i] = 1 / this.get('n');
        }

        var fMatrix = Matrix.create(fArray);
        this.set('F', fMatrix);

        return fMatrix;
    },

    makeOMatrix: function() {
        var n = 0;
        var oArray = [], arr = [];
        for(var i = 0; i < this.get('n'); i++) {
            arr = this.get('discrepencies');
            n = arr[i];
            arr = this.get('errorProbabilities');
            oArray[i] = arr[n];
        }
        
        var oMatrix = Matrix.Diagonal(oArray);
        this.set('O', oMatrix);

        return oMatrix;
    },

    makeZMatrix: function() {
        var zMatrix = this.get('O').multiply(this.get('Y'));
        this.set('Z', zMatrix);
        return zMatrix;
    },

    calculateYMatrix: function() {
        var yMatrix = this.get('R').multiply(this.get('F'));

        this.set('Y', yMatrix);
        return yMatrix;
    },

    calculateDiscrepencies: function(sensoryInput) {
        var discrepencyCounts = [];
        var temp = [];
        var roomMap = [];
        var count = 0;
    
       for (var i = 0; i < gridMap.length; i++) {

            temp = sensoryInput;

            roomMap = gridMap.at(i).get('walls');


            for (var j = 0; j < temp.length; j++) {

                if(temp[j] != roomMap[j]) {
                    count++;
                }
            }

            discrepencyCounts[i] = count;
            count = 0;
            temp = [];
        }

        this.set('discrepencies', discrepencyCounts);

    },

    calculateNormalizationSum: function() {
        var sum = 0;
        for (var i = 0; i < this.get('n'); i++) {
            var value = this.get('Z').e(i + 1, 1);
            sum += value;
        }

        this.set('normalizationSum', sum);
        return sum;
    },

    updateFMatrix: function() {
        var fArray = [];
        for (var i = 0; i < this.get('n'); i++) {

            fArray[i] = this.get('Z').e(i + 1, 1) / this.get('normalizationSum');
           

        }

        var fMatrix = Matrix.create(fArray);
        this.set('F', fMatrix);
        return fMatrix;
    },

    getFMaximum: function() {
        var fMatrix = this.get('F');
        var largest = fMatrix.e(1, 1).toFixed(9);

        for (var i = 0; i < this.get('n'); i++) {
            
            if(largest <= fMatrix.e(i + 1, 1).toFixed(9)) {
                largest = fMatrix.e(i + 1, 1).toFixed(9);
            }
        }
            
        return largest;
    },

    getFMinimum: function() {
        var fMatrix = this.get('F');
        var smallest = fMatrix.e(1, 1).toFixed(9);

        for (var i = 0; i < this.get('n'); i++) {
            
            if(smallest >= fMatrix.e(i + 1, 1).toFixed(9)) {
                smallest = fMatrix.e(i + 1, 1).toFixed(9);
            }
        }

        return smallest;
    },

    getMaxCount: function() {
        var fMatrix = this.get('F');
        var max = this.getFMaximum();
        var count = 0;

        for (var i = 0; i < this.get('n'); i++) {
            
            if(max == fMatrix.e(i + 1, 1).toFixed(9)) {
                count++;
            }
        }

        return count;

    },

    fMatrixIsNotUnique: function() {
        var current;
        var fMatrix = this.get('F');
        for (var i = 0; i < this.get('n'); i++) {
            current = fMatrix.e(i + 1, 1);
            for (var j = i; j < this.get('n') - 2; j++) {

                
                if(current == fMatrix.e(j + 2, 1)) {
                    return true;
                }
            }
        }

        return false;
    },

    showView: function(view) {
                        
                setTimeout(function() {
                    var newView = '#' + view;
                    window.location.href = newView;

                }, 3000);

    },

    displayResults: function() {

        var max = glp.getFMaximum();

        for (var i = 1; i <= glp.get('n'); i++) {

            if(this.get('F').e(i, 1).toFixed(9) == max) {

                $('#highlight' + i).removeClass( "hidden" );
               
            }

        }

        $("#highlight1").animate({bottom:'550px', right:'-3px'}, 1600);
        $("#highlight2").animate({bottom:'550px', right:'5px'}, 1600);
        $("#highlight3").animate({bottom:'550px', right:'12px'}, 1600);
        $("#highlight4").animate({bottom:'550px', right:'20px'}, 1600);
        $("#highlight5").animate({bottom:'550px', right:'29px'}, 1600);

        $("#highlight6").animate({bottom:'550px', right:'-6'}, 1600);
        $("#highlight7").animate({bottom:'550px', left:'95px'}, 1600);
        $("#highlight8").animate({bottom:'550px', left:'187px'}, 1600);

        $("#highlight9").animate({bottom:'548px', right:'-3px'}, 1600);
        $("#highlight10").animate({bottom:'548px', right:'5px'}, 1600);
        $("#highlight11").animate({bottom:'548px', right:'12px'}, 1600);
        $("#highlight12").animate({bottom:'548px', right:'20px'}, 1600);
        $("#highlight13").animate({bottom:'548px', right:'29px'}, 1600);

        $("#robotImage").animate({right:'525px'}, 1600);
    },

    runAnimation: function() {

        $.playSound('audio/system-activated.mp3').delay(1000);

        // Copy user inputs into sensoryInput Array
        sensoryInputCollection.each(function(selection) {
            glp.get('sensoryInput').push(selection.get('sensedInput'));
        });

        // Set user's animation type preferences

        if ($('#automatic').is(':checked')){
            glp.set('animationType', true);
        } else {
            glp.set('animationType', false);
        }

        var speed = $("#animation-speed").find(":selected").val();
        glp.set('animationSpeed', speed);

        // Calculate and generate R Matrix
        glp.makeRMatrix();

        // Initialize F Matrix
        glp.makeFMatrix();

        // Set glp.t equal to the number of sensory inputs
        this.set('t', this.get('sensoryInput').length);

        $("#starting-view").hide();

        glp.showView('rfyView');  
    
        
    }

});



var GridMap = Backbone.Collection.extend();
var gridMap = new GridMap([
{
    walls: [1,0,1,0],
    cardinals: 'NW',
    adjPaths: [2, 6],
    id: 1
},
{
    walls: [1,1,0,0],
    cardinals: 'NS',
    adjPaths: [1, 3],
    id: 2
},
{
    walls: [1,0,0,0],
    cardinals: 'N',
    adjPaths: [2, 4, 7],
    id: 3
},
{
    walls: [1,1,0,0],
    cardinals: 'NS',
    adjPaths: [3, 5],
    id: 4
},
{
    walls: [1,0,0,1],
    cardinals: 'NE',
    adjPaths: [4, 8],
    id: 5
},
{
    walls: [0,0,1,1],
    cardinals: 'WE',
    adjPaths: [1, 9],
    id: 6
},
{
    walls: [0,0,1,1],
    cardinals: 'WE',
    adjPaths: [3, 11],
    id: 7
},
{
    walls: [0,0,1,1],
    cardinals: 'WE',
    adjPaths: [5, 13],
    id: 8
},
{
    walls: [0,1,1,0],
    cardinals: 'SW',
    adjPaths: [6, 10],
    id: 9
},
{
    walls: [1,1,0,0],
    cardinals: 'NS',
    adjPaths: [9, 11],
    id: 10
},
{
    walls: [0,1,0,0],
    cardinals: 'S',
    adjPaths: [7, 10, 12],
    id: 11
},
{
    walls: [1,1,0,0],
    cardinals: 'NS',
    adjPaths: [11, 13],
    id: 12
},
{
    walls: [0,1,0,1],
    cardinals: 'SE',
    adjPaths: [8, 12],
    id: 13
}

]);


var SensoryInput = Backbone.Model.extend({});

var SensoryInputCollection = Backbone.Collection.extend({

    model: SensoryInput

});

var sensoryInputCollection = new SensoryInputCollection();



var SensoryInputView = Backbone.View.extend({

    tagName: 'tr',

    template: template('sensoryInputListTemplate'),

    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
    },

    events: {
        'click .glc-edit-row': 'editRow',
        'click .glc-delete-row': 'destroy'
    },

    editRow: function() {
      var newCardinals = prompt('What would you like to change the Cardinals to?', this.model.get('cardinals'));
      if ( ! $.trim(newCardinals) ) return;
      this.model.set('cardinals', newCardinals);
    },

    destroy: function() {
      this.model.destroy();
    },

    remove: function() {
      sensoryInputCollection.remove(this.model);
      console.log('Removed item from sensoryInputCollection:');
      console.log(sensoryInputCollection.toJSON());
      this.$el.remove();

    },

    render: function() {
        var template = this.template(this.model.toJSON());
        this.$el.html( template );
        return this;
    }

});


var SensoryInputListView = Backbone.View.extend({

    tagName: 'tbody',

    initialize: function() {
      this.collection.on('add', this.addOne, this);
    },

    render: function() {
        this.collection.each(this.addOne, this);
        return this;
    },

    addOne: function(selection) {
        var sensoryInputView = new SensoryInputView( {model: selection} );
        sensoryInputView.render();

        this.$el.append(sensoryInputView.el);
    }

});


var sensoryInputOptionsCollection = new SensoryInputCollection([

    {
        sensedInput: [0,0,0,0],
        cardinals: 'NULL',
        id: 'dir15'
    },
    {
        sensedInput: [0,0,0,1],
        cardinals: 'E',
        id: 'dir3'
    },
    {
        sensedInput: [0,0,1,0],
        cardinals: 'W',
        id: 'dir2'
    },
    {
        sensedInput: [0,0,1,1],
        cardinals: 'WE',
        id: 'dir14'
    },
    {
        sensedInput: [0,1,0,0],
        cardinals: 'S',
        id: 'dir1'
    },
    {
        sensedInput: [0,1,0,1],
        cardinals: 'SE',
        id: 'dir12'
    },
    {
        sensedInput: [0,1,1,0],
        cardinals: 'SW',
        id: 'dir13'
    },
    {
        sensedInput: [0,1,1,1],
        cardinals: 'SWE',
        id: 'dir11'
    },
    {
        sensedInput: [1,0,0,0],
        cardinals: 'N',
        id: 'dir0'
    },
    {
        sensedInput: [1,0,0,1],
        cardinals: 'NE',
        id:'dir10'
    },
    {
        sensedInput: [1,0,1,0],
        cardinals: 'NW',
        id: 'dir9'
    },
    {
        sensedInput: [1,0,1,1],
        cardinals: 'NWE',
        id: 'dir7'
    },
    {
        sensedInput: [1,1,0,0],
        cardinals: 'NS',
        id: 'dir8'
    },
    {
        sensedInput: [1,1,0,1],
        cardinals: 'NSE',
        id: 'dir6'
    },
    {
        sensedInput: [1,1,1,0],
        cardinals: 'NSW',
        id: 'dir5'
    },
    {
        sensedInput: [1,1,1,1],
        cardinals: 'NSWE',
        id: 'dir4'
    }

]);

var SensoryInputSelectionView = Backbone.View.extend({


   render: function() {
       this.collection.each(function(model) {
          var cardinalPointsView = new CardinalPointsView( {model: model} );
          var id = model.get('id');
          $('#' + id).html(cardinalPointsView.el);
       }, this);

       return this;

   }

});

var CardinalPointsView = Backbone.View.extend({

   events: {
       'click': 'addSelection'
   },

   addSelection: function() {
     var newSelection = new SensoryInput( {cardinals: this.model.get('cardinals'), sensedInput: this.model.get('sensedInput')} );
     sensoryInputCollection.add(newSelection);
   
   },

   initialize: function() {
       this.render();
   },

   render: function() {
       this.$el.html( this.model.get('cardinals'));
       return this;
   }

});


var glp = new GLP();
glp.set('gridMap', gridMap);


var sensoryInputSelectionView = new SensoryInputSelectionView( { collection: sensoryInputOptionsCollection} );
var sensoryInputListView = new SensoryInputListView( {collection: sensoryInputCollection} );
sensoryInputSelectionView.render();
sensoryInputListView.render();
$('#sensory-input-list').html(sensoryInputListView.el);





$(document).ready(function() {
    $('#d0').editable({
        type: 'text',
        title: 'Enter username',
        success: function(response, newValue) {
            var a = glp.get("errorProbabilities"); //update backbone model
            a[0] = parseFloat(newValue).toFixed(4);
            a[0] = parseFloat(a[0]);
            glp.set("errorProbabilities", a);
            glp.set("d0", a[0]);
        }
    });

    $('#d1').editable({
        type: 'text',
        title: 'Enter data',
        success: function(response, newValue) {
            var a = glp.get("errorProbabilities"); //update backbone model
            a[1] = parseFloat(newValue).toFixed(4);
            a[1] = parseFloat(a[1]);
            glp.set("errorProbabilities", a);
            glp.set("d1", a[1]);
        }
    });

    $('#d2').editable({
        type: 'text',
        title: 'Enter data',
        success: function(response, newValue) {
            var a = glp.get("errorProbabilities"); //update backbone model
            a[2] = parseFloat(newValue).toFixed(4);
            a[2] = parseFloat(a[2]);
            glp.set("errorProbabilities", a);
            glp.set("d2", a[2]);
        }
    });

    $('#d3').editable({
        type: 'text',
        title: 'Enter data',
        success: function(response, newValue) {
            var a = glp.get("errorProbabilities"); //update backbone model
            a[3] = parseFloat(newValue).toFixed(4);
            a[3] = parseFloat(a[3]);
            glp.set("errorProbabilities", a);
            glp.set("d3", a[3]);
        }
    });

    $('#d4').editable({
        type: 'text',
        title: 'Enter data',
        success: function(response, newValue) {
            var a = glp.get("errorProbabilities"); //update backbone model
            a[4] = parseFloat(newValue).toFixed(4);
            a[4] = parseFloat(a[4]);
            glp.set("errorProbabilities", a);
            glp.set("d4", a[4]);
        }
    });
});

