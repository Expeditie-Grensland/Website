$(document).ready(function(){
    console.log('Document ready')

    //Start slick
    $('#columns').slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        focusOnSelect: true,
        centerMode: true,
        initialSlide: 1
    })


    $('.expeditie').click(function (event) {  //Bind button click for expeditie
        const column = $(event.target).parent()

        if(column.hasClass('slick-current')) {

        }
    }).hover(function () {
        $(this).addClass('hover');
        $(this).parent().children('.background').addClass('hover');
        console.log("hover")
    }, function () {
        $(this).removeClass('hover');
        $(this).parent().children('.background').removeClass('hover');
        console.log("unhover")
    });
})
