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
        const died = $("#died")
        const maurice = $("#maurice")
        const ronald = $("#ronald")

        const dContents = getFileContents((<any>died[0]).files[0])
        const mContents = getFileContents((<any>maurice[0]).files[0])
        const rContents = getFileContents((<any>ronald[0]).files[0])

        Promise.all([dContents, mContents, rContents]).then(([d, m, r]) => {
            console.log("Uploading...")

            const completeData = {
                diederik: d,
                maurice: m,
                ronald: r
            }

            const uri = "/import_kaukasus/data"
            const xhr = new XMLHttpRequest()

            xhr.open("POST", uri, true)
            xhr.setRequestHeader("Content-Type", "application/json")
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    console.log("Uploading done.")
                    alert(xhr.responseText) // handle response.
                }
            }

            xhr.send(JSON.stringify(completeData))
        }).catch(reason => alert("Could not parse file: " + reason))
    })

})