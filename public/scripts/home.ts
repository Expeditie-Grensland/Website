$(document).ready(function(){
    console.log('Document ready')

    //Start slick
    $('#columns').slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 100,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        focusOnSelect: true,
        centerMode: true,
        initialSlide: 1
    })


    $('.expeditie').hover(function () {
        $(this).addClass('hover')
        $(this).parent().children('.background').addClass('hover')
    }, function () {
        $(this).removeClass('hover')
        $(this).parent().children('.background').removeClass('hover')
    });
})
