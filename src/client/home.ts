import $ from 'jquery';
import 'bootstrap';

import { registerWorker } from './workerHelper/register';

$(() => {
    registerWorker();

    const columnDiv = $('#columns');
    const columns = $('.column');
    const leftArrow = $('.arrow.left');
    const rightArrow = $('.arrow.right');
    const html = $('html');

    const expeditieCount = columns.length;

    const getColumnWidth = () =>
        columnDiv.width()! / expeditieCount;

    const expeditiesOnScreen = () =>
        Math.round($(window).width()! / getColumnWidth());

    const scrollToExpeditieOffset = (t: number = 500) => {
        expeditieOffset = Math.min(expeditieCount - expeditiesOnScreen(), Math.max(0, expeditieOffset)) || 0;

        let newScroll = Math.min(columnDiv.width()! - $(window).width()!, Math.max(0, expeditieOffset * getColumnWidth())) || 0;

        if (expeditieOffset == 0) leftArrow.stop().hide(t);
        else leftArrow.stop().show(t);

        if (expeditieOffset == expeditieCount - expeditiesOnScreen()) rightArrow.stop().hide(t);
        else rightArrow.stop().show(t);

        html.stop().animate({ scrollLeft: newScroll }, t);
    };

    let expeditieOffset = Math.round($(window).scrollLeft()! / getColumnWidth());

    scrollToExpeditieOffset(200);

    leftArrow.on('click', () => {
        expeditieOffset--;
        scrollToExpeditieOffset();
    });

    rightArrow.on('click', () => {
        expeditieOffset++;

        scrollToExpeditieOffset();
    });

    $(window).on('resize', () =>
        scrollToExpeditieOffset(0)
    );

    $('.videoModal').on('hide.bs.modal', function () {
        (<HTMLVideoElement>$(this).find('video')[0]).pause();
    });
});
