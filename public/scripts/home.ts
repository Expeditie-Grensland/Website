$(document).ready(() => {
    console.log('Document ready')

    const columns = $('#columns')
    const column = $('.column')

    const expeditieCount = column.length

    columns.slick({
        dots:           expeditieCount > 5,
        arrows:         expeditieCount > 5,
        speed:          400,
        infinite:       false,
        slidesToShow:   Math.min(5, expeditieCount),
        slidesToScroll: 1,
        responsive:     [
            {
                breakpoint: 1500,
                settings:   {
                    dots:         expeditieCount > 4,
                    arrows:       expeditieCount > 4,
                    slidesToShow: Math.min(4, expeditieCount)
                }
            },
            {
                breakpoint: 1200,
                settings:   {
                    dots:         expeditieCount > 3,
                    arrows:       expeditieCount > 3,
                    slidesToShow: Math.min(3, expeditieCount)
                }
            },
            {
                breakpoint: 900,
                settings:   {
                    dots:         expeditieCount > 2,
                    arrows:       expeditieCount > 2,
                    slidesToShow: Math.min(2, expeditieCount)
                }
            },
            {
                breakpoint: 600,
                settings:   {
                    dots:         expeditieCount > 1,
                    arrows:       expeditieCount > 1,
                    slidesToShow: 1
                }
            }
        ]
    })

    column.hover(function () {
        const hover = $(this)
        const count = $('div.slick-active').length

        const links = hover.find('.links')
        links.css({'height': links[0].scrollHeight + 'px'})

        if (count > 1) {
            $(".column.slick-active").each(function () {
                const column = $(this)
                const origWidth = window.innerWidth / count
                const larger = origWidth * 1.20
                const smaller = (window.innerWidth - larger) / (count - 1)
                column.css({'width': ((column.is(hover)) ? larger : smaller) + "px"})
            })
        }
    }, function () {
        const hover = $(this)
        const count = $('div.slick-active').length

        const links = hover.find('.links')
        links.css({'height': '0px'})

        if (count > 1) {
            $(".column.slick-active").each(function () {
                const column = $(this)
                column.css({'width': window.innerWidth / count + "px"})
            })
        }
    })

    $('.videoModal').on('hide.bs.modal', function () {
        videojs($(this).find('.video-js')[0]).pause()
    })

    $('.overviewMapModal').on('show.bs.modal', function (event) {
        const modal = $(this)
        const button = $(event.relatedTarget)
        const color = button.data('expeditie-color')
        const modalTitle = button.data('modal-title')
        const countries = button.data('countries').split('\\')

        const title = modal.find('.modal-title')
        title.html(modalTitle)

        const svgmap = modal.find('#svgmap')
        const modalBody = modal.find('.modal-body')

        if (svgmap.length == 0) {
            modalBody.find('.loadingSpinner').on('mapLoaded', function () {
                colorCountries(modal, color, countries)
            })
        } else {
            colorCountries(modal, color, countries)
        }
    })

    function colorCountries(modal, color, countries) {
        //Reset colors
        for (let path of modal.find('#svgmap').children()) {
            $(path).removeAttr('style')
        }

        for (let country of countries) {
            //Spaces are not allowed in ids and escape . characters in css selector
            const countrySelector = '#' + country.replace(/ /gi, "_").replace(/\./gi, "\\.")

            modal.find(countrySelector).css({
                fill:   color,
                stroke: '#fff'
            })
        }
    }
})

$(window).on("load", function () {
    $.get('overviewMap', function (data) {
        const mapContainer = $('#overviewMap')
        const loadingSpinner = mapContainer.find('.loadingSpinner')

        loadingSpinner.hide()

        //Add map
        mapContainer.append(data)

        loadingSpinner.trigger('mapLoaded')
        //Hide spinner
        loadingSpinner.remove()
    }).fail(function () {
        alert('Something went wrong when loading the overview map!')
    })
})
