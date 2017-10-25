$(document).ready(function(){
    console.log('Document ready')

    const column = $('.column')

    const screen = window.matchMedia( "screen" ).matches
    const expeditieCount = column.length

    console.log(`Displaying ${expeditieCount} columns on ${screen ? "touchscreen" : "non-touchscreen"} layout`)

    const vw = window.innerWidth
    const vh = window.innerHeight

    const columns = $('#columns')

    columns.slick({
        dots: expeditieCount > 5,
        arrows: expeditieCount > 5,
        speed: 400,
        infinite: false,
        slidesToShow: Math.min(5, expeditieCount),
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1500,
                settings: {
                    dots: expeditieCount > 4,
                    arrows: expeditieCount > 4,
                    slidesToShow: Math.min(4, expeditieCount)
                }
            },
            {
                breakpoint: 1200,
                settings: {
                    dots: expeditieCount > 3,
                    arrows: expeditieCount > 3  ,
                    slidesToShow: Math.min(3, expeditieCount)
                }
            },
            {
                breakpoint: 900,
                settings: {
                    dots: expeditieCount > 2,
                    arrows: expeditieCount > 2,
                    slidesToShow: Math.min(2, expeditieCount)
                }
            },
            {
                breakpoint: 600,
                settings: {
                    dots: expeditieCount > 1,
                    arrows: expeditieCount > 1,
                    slidesToShow: 1
                }
            }
        ]
    })


    $('.overviewThumb').click(function (event) {
        const expeditie = $(event.target).parent().parent().find('.expeditie').attr('id')

        $(".overviewMapModal" + expeditie).modal("toggle")
    })

    $('.movieThumb').click(function (event) {
        const expeditie = $(event.target).parent().parent().find('.expeditie').attr('id')

        $(".movieModal" + expeditie).modal("toggle")
    })
})

$(window).on("load", function() {
    $('.overviewMap').attr('src', '/svgmap')
})
