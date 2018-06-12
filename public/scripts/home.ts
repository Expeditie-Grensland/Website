$(document).ready(() => {
    console.log('Document ready')

    const columnDiv = $('#columns')
    const columns = $('.column')
    const leftArrow = $('.arrow.left')
    const rightArrow = $('.arrow.right')
    const html = $('html')

    const expeditieCount = columns.length

    const columnWidth = columnDiv.width() / expeditieCount

    if($(window).scrollLeft() <= 0)
        leftArrow.addClass('grey')

    if($(window).scrollLeft()+1 >= (expeditieCount * columnWidth) - $(window).width())
        rightArrow.addClass('grey')

    leftArrow.click(() => {
        let newScroll = $(window).scrollLeft() - columnWidth

        if(newScroll < 0)
            newScroll = 0

        rightArrow.removeClass('grey')
        html.stop().animate({ scrollLeft: newScroll }, 500);

        if(Math.round(newScroll) <= 0)
            leftArrow.addClass('grey')
    })

    rightArrow.click(() => {
        let newScroll = $(window).scrollLeft() + columnWidth

        if(newScroll > expeditieCount * columnWidth)
            newScroll = expeditieCount * columnWidth

        leftArrow.removeClass('grey')
        html.stop().animate({
            scrollLeft: newScroll
        }, 500);

        if(Math.round(newScroll) >= Math.round((expeditieCount * columnWidth) - $(window).width()))
            rightArrow.addClass('grey')
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
