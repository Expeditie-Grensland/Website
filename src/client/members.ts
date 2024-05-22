import $ from 'jquery';

$('.form-confirm').on('submit', () => {
    return confirm('Weet je het zeker?');
});

$('.form-array-add').on('click', function () {
    const arr = $(this).parent('.form-array');
    const proto = arr.find('.form-array-proto');

    // Copy 'prototype' element from dom, enable and un-hide it.
    const newElem = proto.clone()
        .removeAttr('hidden')
        .removeAttr('disabled')
        .removeClass('form-array-proto')
        .addClass('form-array-item');

    // Remove disabled from prototype children
    newElem.find(':disabled').each(function () {
        $(this).removeAttr("disabled");
    })

    // Insert newly created form element
    newElem.insertBefore(proto);

    arr.find('.form-array-remove').removeAttr('disabled');

    return false;
});

$('.form-array-remove').on('click', function () {
    const arr = $(this).parent('.form-array');
    const items = arr.find('.form-array-item');
    const allowEmpty = $(arr).hasClass("form-array-allow-empty");

    if (items.length > (allowEmpty ? 0 : 1))
        items.last().remove();

    if (items.length < (allowEmpty ? 2 : 3))
        $(this).attr('disabled', '');

    return false;
});

$('.form-array').each(function () {
    const allowEmpty = $(this).hasClass("form-array-allow-empty");

    if ($(this).find('.form-array-item').length < (allowEmpty ? 1 : 2))
        $(this).find('.form-array-remove').attr('disabled', '');
});
