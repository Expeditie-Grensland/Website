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

    column.click(function (event) {
        const column = $(event.target).parents('.column')

        if(column.hasClass('clicked'))
            return

        const columnNr = Number(column.attr('data-slick-index'))

        if(columnNr > expeditieCount - 5) {
            for(let i = 0; i < columnNr - (expeditieCount -5); i++) {
                console.log("adding column..")
                columns.slick('slickAdd', '<div class="empty column"></div>')
            }
        }

        columns.slick('slickGoTo', columnNr, false)

        column.addClass('clicked')

        const otherColumns = column.parent().children('.column:not(.clicked)')

        for(let column of otherColumns) {
            $(column).addClass('notclicked')
        }

        $('.slick-dots').addClass('hidden')
        $('.slick-arrow').addClass('hidden')
        $('#closeOverlay').removeClass('hidden')

        $('#mapContainer').css({
            left: column.outerWidth() + 'px'
        }).removeClass('hidden')
    })

    $('#closeOverlay').click(function (event) {
        const clickedColumn = $('.clicked')
        const slickSlide = $('.slick-slide')

        columns.slick('slickGoTo', slickSlide.index(clickedColumn), false)

        $('.slick-dots').removeClass('hidden')
        $('.slick-arrow').removeClass('hidden')
        $('#closeOverlay').addClass('hidden')
        $('#mapContainer').addClass('hidden')

        $('.notclicked').removeClass('notclicked')
        clickedColumn.removeClass('clicked')

        const empties = $('.empty')

        console.log(empties.length + ' empties.')

        for(let i = empties.length; i > 0; i--) {
            console.log("removing column")
            console.log(empties[i-1])
            columns.slick('slickRemove', slickSlide.index(empties[i-1]), false)
        }
    })
})

$(window).on( "load", function() {
    $('#map').attr('src', '/svgmap')
})
