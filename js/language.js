$('select').on('change', function(){
    var langVal = $(this).val();
    $('.mobile a span').text(langVal);

});



