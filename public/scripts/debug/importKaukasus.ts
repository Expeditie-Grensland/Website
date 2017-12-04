

$(document).ready(() => {

    $('#data').change((event) => {
        let filename = $('#data').val();

        if(filename !== null && filename !== "") {
            console.log('upload!')

            console.log(this)

            let file = this.files[0]

            let uri = "/import_kaukasus/data";
            let xhr = new XMLHttpRequest();

            xhr.open("POST", uri, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    alert(xhr.responseText); // handle response.
                }
            };
            console.log(file)

            xhr.send(file.body)
        }
    })

})