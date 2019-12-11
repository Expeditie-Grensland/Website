import $ from 'jquery';
import 'bootstrap';

$('.form-confirm').on('submit', () => {
    return confirm('Weet je het zeker?');
});

$('.custom-file-input').on('change', function () {
    // @ts-ignore
    const files = $(this)[0].files;

    let fileNames = [];

    for (let file of files)
        fileNames.push(file.name);

    $(this).siblings('.custom-file-label').addClass('selected').html(fileNames.length ? fileNames.join(', ') : 'Kies bestanden');
});

$('.form-array-add').on('click', function () {
    const arr = $(this).parent('.form-array');
    const proto = arr.find('.form-array-proto');

    proto.clone()
        .removeAttr('hidden')
        .removeAttr('disabled') // In the future, this may need to be updated to include children.
        .removeClass('form-array-proto')
        .addClass('form-array-item')
        .insertBefore(proto);

    arr.find('.form-array-remove').removeAttr('disabled');

    return false;
});

$('.form-array-remove').on('click', function () {
    const arr = $(this).parent('.form-array');
    const items = arr.find('.form-array-item');

    if (items.length > 1)
        items.last().remove();

    if (items.length < 3)
        $(this).attr('disabled', '');

    return false;
});

$('.form-array').each(function () {
    if ($(this).find('.form-array-item').length < 2)
        $(this).find('.form-array-remove').attr('disabled', '');
});
