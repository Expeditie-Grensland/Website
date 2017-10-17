$(document).ready(function(){
    $('#columns').slick({
        dots: true,
        arrows: true,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        focusOnSelect: true,
        centerMode: true
    })
})