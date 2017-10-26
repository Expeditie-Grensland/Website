$(document).ready(function(){
    console.log('Document ready')

    const column = $('.column')

    const screen = window.matchMedia( "screen" ).matches
    const expeditieCount = column.length

    console.log(`Displaying ${expeditieCount} columns on ${screen ? "touchscreen" : "non-touchscreen"} layout`)

    const columns = $('#columns')

    function getColumnOnScreenCount() {
        return $('.slick-active').length
    }

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

    column.hover(function(){
        const hover = $(this)
        $(".column").each(function(){
            const column = $(this)
            const origWidth = window.innerWidth/getColumnOnScreenCount()
            const larger = origWidth * 1.20
            const smaller = (window.innerWidth - larger)/(getColumnOnScreenCount() - 1)
            column.stop(true)
            column.animate({'width': ((column.is(hover))?larger:smaller) + "px"}, 300, 'easeOutCirc')
        })
    }, function(){
        $(".column").each(function(){
            const column = $(this)
            column.stop(true)
            column.animate({'width': window.innerWidth/getColumnOnScreenCount() + "px"}, 300, 'easeOutCirc')
        })
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
