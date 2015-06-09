$(document).ready(function() {
    $('.ctr-tabs a').click(function(e){
        e.preventDefault();
        $('.ctr-tabs a.active').removeClass('active');
        $(this).addClass('active');
        $('.content-ctrl .content-tab').hide();
        $($(this).attr('href')).slideDown();
    });
    $('.view-more').hover(function(){
        $(this).children('.cat').slideDown();
    }, function(){
        $(this).children('.cat').slideUp();
    });
});