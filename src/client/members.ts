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
