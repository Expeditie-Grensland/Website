function getFileContents(file): Promise<LegacyTables.Kaukasus.ExportJSON> {
    return new Promise((resolve, reject) => {
        if(file) {
            let reader = new FileReader()
            reader.readAsText(file, "UTF-8")
            reader.onload = (e) => {
                resolve(JSON.parse((<any>e.target).result))
            }
            reader.onerror = (e) => {
                alert("error")
                reject("Error reading file")
            }
        } else {
            reject("No file selected!")
        }
    })
}

$(document).ready(() => {

    $("#submit").click(() => {
        const json = $("#json")

        const jsonContents = getFileContents((<any>json[0]).files[0])

        jsonContents.then(content => {
            console.log("Uploading...")

            const uri = "/import_balkan/data"
            const xhr = new XMLHttpRequest()

            xhr.open("POST", uri, true)
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log("Uploading done.")
                    alert(xhr.responseText) // handle response.
                }
            }

            xhr.send(JSON.stringify(content))
        }).catch(reason => alert("Could not parse file: " + reason))
    })

})