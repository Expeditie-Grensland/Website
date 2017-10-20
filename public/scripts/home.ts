$(document).ready(function(){
    console.log('Document ready')

    const mobileLayout = window.matchMedia( "screen and (max-width: 720px)" ).matches
    const expeditieCount = $('.column').length

    console.log(`Displaying ${expeditieCount} columns on ${mobileLayout ? "mobile" : "desktop"} layout`)

    const vw = window.outerWidth
    const vh = window.outerHeight

    if(mobileLayout || expeditieCount > 5) {
        const columns = $('#columns')

        if(!mobileLayout) {
            $('.column').css({
                width: vw / 20,
            })
        }

        //Start slick
        columns.slick({
            dots:           true,
            draggable:      mobileLayout,
            arrows:         mobileLayout,
            infinite:       mobileLayout,
            speed:          400,
            slidesToShow:   1,
            slidesToScroll: 1,
            variableWidth:  true,
            focusOnSelect:  true,
            centerMode:     true,
            initialSlide:   mobileLayout ? 0 : 2
        });

        if(!mobileLayout) {
            const track = $('.slick-track')

            columns.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
                if(nextSlide < 3) {
                    console.log('stop')
                    track.addClass('track-begin')
                } else {
                    track.removeClass('track-begin')
                }
                if(nextSlide > expeditieCount - 4) {
                    console.log('stop end')
                    track.addClass('track-end')
                    track.css('left', -.2 * vw)
                } else {
                    track.removeClass('track-end')
                    track.css('left','')
                }
            })

            track.css('transform', 'translate3d(0px, 0px, 0px)')

            new MutationObserver(function (mutations) {
                mutations.forEach(function (mutationRecord) {
                    const target = $(mutationRecord.target)

                    const translateX = Number(target.css('transform').split(',')[4])
                    if (translateX > 0) {
                        target.css('transform', 'translate3d(0, 0, 0)')
                    }
                })
            }).observe(track[0], {attributes: true, attributeFilter: ['style']})
        }
    } else {
        $('.column').css({
            width: vw / expeditieCount,
        })
    }
})
