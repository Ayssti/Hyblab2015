/**
 * @author Claire REMY
 * 
 * js file for the interactive tab
 */


/**
 * Sidebar
 */
(function sidebar(){
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
})();

/**
 * Slider functions
 */
(function sliderF(){
    $(function sliderF(){
        $('#sl1').slider({
          	formater: function(value) {
            return value;
          }
        });
        $('#eg input').slider();
    });
})();

/**
 * Tooltip functions
 */
$('.criteria label').tooltip({
    placement: 'top'
});

/**
 * Town Selection
 */
var clicks = ['Aix-Marseille','Nantes'];

$('.towns > label').on('click', function(e){
    if(clicks.indexOf($(e.target).attr('id')) === -1) {
        if(clicks.length < 2) {
            clicks.push($(e.target).attr('id'));
        } else {
            $('#'+clicks[0]).toggleClass('active',false);
            clicks.shift();
            clicks.push($(e.target).attr('id'));
        }
        $('#city1').html(clicks[0]);
        $('#city2').html(clicks[1]);
    }else{
        $('#' + $(e.target).attr('id')).toggleClass('active');
    }
});


/**
 * fills a tab with the arguments selected by the user
 * then sends a get request which returns a json object filled with the data to be displayed
 * ajax request in the form of : https://hyblab2015bis-anhaflint.c9.io/tableau?nom=Lille&annee=2008&codeNAF=26.20Z-26.30Z-46.51Z-46.18Z
 */
var nafCodes = ["26_20Z","26_30Z"];
var requestedNAF, id, yearSliderValue;
//Build naf codes tab on each click
$('.criteria > label').on('click', function(e){
    //e.preventDefault();
    id = $(e.target).attr('id');
    if( (nafCodes.indexOf(id) >= 0)) {
        nafCodes.splice(nafCodes.indexOf(id), 1);
    } else if( (nafCodes.indexOf(id) === -1) && (nafCodes.length >= 6)) {
        $('#' + id).toggleClass('active');
    } else if( (nafCodes.indexOf(id) === -1) && (nafCodes.length < 6)) {
        nafCodes.push(id);
    }
});


/**
 * loads requested data and edits the DOM according to the returned value
 * @param town index of the town to query
 */
function loadData(indexOfTown) {
    requestedNAF = nafCodes.join('-');
    //yearSliderValue = $('#sl1').data('slider').getValue();
    if(clicks.length === 0) {
        $('#city1, #city2').text('Choisissez deux villes pour commencer l\'expérience !');
    }else{
        $.getJSON('tableau?nom=' + clicks[indexOfTown] + '&annee=' + yearSliderValue + '&codeNAF=' + requestedNAF, function(data) {
            var tabCell = "";
            var tabNoRow;
            
            tabCell = "<div class=\"row\">";
            for(var i in data) {
                var style= "";
                if(data[i].libelleNAF.length >= 50) {
                    style = "font-size: 10px;";
                }
                if(i==0) {
                    tabNoRow = "<div class=\" col-xs-6 col-md-6 col-lg-6\"><div class=\"number col-xs-12 col-md-offset-4 col-md-3 col-lg-offset-4 col-lg-3\">"+data[i].nb+"</div><div class=\"libelle\" style=\"" + style + "\">"+data[i].libelleNAF+"</div></div>";
                }else{
                    tabNoRow = "<div class=\" col-xs-6 col-md-6 col-lg-6\"><div class=\"number col-xs-12 col-md-offset-4 col-md-3 col-lg-offset-4 col-lg-3\">"+data[i].nb+"</div><div class=\"libelle\" style=\"" + style + "\">"+data[i].libelleNAF+"</div></div>";   
                }
                if( ((i+1)%2 === 0 ) && ( i !== 0 ) ) {
                    tabCell += tabNoRow;
                    tabCell += "</div><div class=\"row\">";
                }else{
                    tabCell += tabNoRow;
                }
            }
            tabCell += "</div>";
            $('.city .tab' + indexOfTown).html(
                tabCell
                );
        });
    }
}

/**
 * load data on each triggering event
 * 
 * @event on new town selection
 * @event on new year selection
 * @event on add or removing search criterias
 */
$('document').ready(function(){
    yearSliderValue = $('#sl1').data('slider').getValue();
    loadData(0);
    loadData(1);
});

$('.criteria, .towns').on('click', function(e){
    yearSliderValue = $('#sl1').data('slider').getValue();
    loadData(0);
    loadData(1);
});

$('#sl1').on('slideStop', function(e){
    yearSliderValue = $('#sl1').data('slider').getValue();
    loadData(0);
    loadData(1);
    $('#yearHeader').text($('#sl1').data('slider').getValue());
});

/**
 * @author Claire REMY
 * 
 * refresh naf codes on click on refresh button
 */
$('#refreshButton span').on('click', function(e) {
    for(var i in nafCodes) {
        $('#' + nafCodes[i]).toggleClass('active');
    }
    nafCodes = [];
    loadData(0);
    loadData(1);
});