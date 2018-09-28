import $ from 'jquery';
import 'bootstrap';

$(() => {
    const columnDiv = $('#columns');
    const columns = $('.column');
    const leftArrow = $('.arrow.left');
    const rightArrow = $('.arrow.right');
    const html = $('html');

    const expeditieCount = columns.length;

    // @ts-ignore
    const columnWidth = columnDiv.width() / expeditieCount;

    // @ts-ignore
    if ($(window).scrollLeft() <= 0) leftArrow.addClass('grey');

    // @ts-ignore
    if ($(window).scrollLeft() + 1 >= expeditieCount * columnWidth - $(window).width()) rightArrow.addClass('grey');

    leftArrow.on('click', () => {
        // @ts-ignore
        let newScroll = $(window).scrollLeft() - columnWidth;

        if (newScroll < 0) newScroll = 0;

        rightArrow.removeClass('grey');
        html.stop().animate({ scrollLeft: newScroll }, 500);

        if (Math.round(newScroll) <= 0) leftArrow.addClass('grey');
    });

    rightArrow.on('click', () => {
        // @ts-ignore
        let newScroll = $(window).scrollLeft() + columnWidth;

        if (newScroll > expeditieCount * columnWidth) newScroll = expeditieCount * columnWidth;

        leftArrow.removeClass('grey');
        html.stop().animate(
            {
                scrollLeft: newScroll
            },
            500
        );

        // @ts-ignore
        if (Math.round(newScroll) >= Math.round(expeditieCount * columnWidth - $(window).width()))
            rightArrow.addClass('grey');
    });

    $('.videoModal').on('hide.bs.modal', function () {
        (<HTMLVideoElement>$(this).find('video')[0]).pause();
    });
});
