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

        console.log(column)

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

        columns.append("<div class='mapContainer'><iframe src='/map' id='map'></iframe></div>" )

        const mapContainer = $('.mapContainer')
        const map = $('#map')

        mapContainer.css({
            position: 'absolute',
            left: column.outerWidth() + 'px',
            right: '0px',
            top: '0px',
            bottom: '0px',
            outline: 'none'
        })

        map.css({
            width: '100%',
            height: '100%',
            borderWidth: '0'
        })
    })

    $('#closeOverlay').click(function (event) {
        const clickedColumn = $('.clicked')

        $('.slick-dots').removeClass('hidden')
        $('.slick-arrow').removeClass('hidden')
        $('#closeOverlay').addClass('hidden')

        $('.notclicked').removeClass('notclicked')
        clickedColumn.removeClass('clicked')

        const empties = $('.empty')

        for(let i = 0; i < empties.length; i++) {
            columns.slick('slickRemove', $('.slick-slide').index(empties[i]), false)
            console.log("removing column")
        }

        $('.mapContainer').remove()


        columns.slick('slickGoTo', $('.slick-slide').index(clickedColumn), false)

    })
})
