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
                breakpoint: 1600,
                settings: {
                    dots: expeditieCount > 4,
                    arrows: expeditieCount > 4,
                    slidesToShow: Math.min(4, expeditieCount)
                }
            },
            {
                breakpoint: 1280,
                settings: {
                    dots: expeditieCount > 3,
                    arrows: expeditieCount > 3  ,
                    slidesToShow: Math.min(3, expeditieCount)
                }
            },
            {
                breakpoint: 720,
                settings: {
                    dots: expeditieCount > 2,
                    arrows: expeditieCount > 2,
                    slidesToShow: Math.min(2, expeditieCount)
                }
            },
            {
                breakpoint: 480,
                settings: {
                    dots: expeditieCount > 1,
                    arrows: expeditieCount > 1,
                    slidesToShow: 1
                }
            }
        ]
    })

    column.click(function (event) {
        const column = $(event.target).parents('.column')

        console.log(column)

        columns.slick('slickGoTo', column.attr('data-slick-index'), false)

        column.addClass('clicked')

        const otherColumns = column.parent().children('.column:not(.clicked)')

        for(let column of otherColumns) {
            $(column).addClass('notclicked')
        }

        columns.append("<div class='mapContainer'><iframe src='/map' id='map'></iframe></div>" )

        const mapContainer = $('.mapContainer')
        const map = $('#map')

        mapContainer.css({
            position: 'absolute',
            left: column.outerWidth() + 'px',
            right: '0px',
            top: '0px',
            bottom: '0px'
        })

        map.css({
            width: '100%',
            height: '100%'
        })
    })
})
