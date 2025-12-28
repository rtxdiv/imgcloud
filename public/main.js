const fileInp = document.querySelector('#fileInp')


async function send() {

    const files = fileInp.files
    if (files.length == 0) return

    const formData = new FormData()

    Array.from(files).forEach(file => {
        formData.append('files', file)
    })

    const resp = await fetch('/image/upload', {
        method: 'POST',
        body: formData
    })
    if (resp.ok) {
        console.log('Успешно')
    }
    const json = await resp.json()
    console.log(json)
}