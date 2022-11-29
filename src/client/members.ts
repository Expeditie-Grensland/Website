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

/**
 * Hides form fields based on the value of a 'select' tag.
 * Select tag should have the '.form-select-change-form' class.
 * Form parts are shown/hidden based on the 'data-select-val' attribute on elements with a '.form-select-show' class.
 * See /leden/admin/story.pug for example.
 */
function changingFormHandler() {
    const value = $(this).find(':selected').val()
    const dependants = $(this).parents('.form-boundary').find('.form-select-show')

    dependants.each(function () {
        const attr = $(this).attr("data-select-val")

        if (attr === value) {
            $(this).show()

            // Re-require required children
            $(this).find("[data-was-required]").each(function () {
                $(this).removeAttr("data-was-required")
                $(this).attr("required", "true")
            })
        } else {
            $(this).hide()

            // Un-require required children
            $(this).find("[required]").each(function () {
                $(this).removeAttr("required")
                $(this).attr("data-was-required", "true")
            })
        }
    })
}

$('.form-select-change-form').on('change', changingFormHandler);
$('.form-select-change-form').each(changingFormHandler);
