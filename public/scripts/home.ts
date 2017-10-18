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

    //Bind button click for expeditie
    $('.expeditie').click(function (event) {
        const column = $(event.target).parent()

        if(column.hasClass('slick-current')) {

        }
    })
})
