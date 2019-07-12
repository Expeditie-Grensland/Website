$(document).ready(() => {

    function getFileContents(file: File): Promise<any> {
        return new Promise((resolve, reject) => {
            if(file) {
                let reader = new FileReader()
                reader.readAsText(file, "UTF-8")
                reader.onload = (e: any) => {
                    resolve(e.target.result)
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

    $("#submit").click(() => {
        const json = $("#json")

        const jsonContents = getFileContents((<any>json[0]).files[0])

        jsonContents.then(content => {
            console.log("Uploading...")

            const uri = "/import_stan/data"
            const xhr = new XMLHttpRequest()

            xhr.open("POST", uri, true)
            xhr.setRequestHeader("Content-Type", "application/gpx")
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log("Uploading done.")
                    alert(xhr.responseText) // handle response.
                }
            }

            xhr.send(content)
        }).catch(reason => alert("Could not parse file: " + reason))
    })

})
