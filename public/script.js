const fileInp = document.querySelector('#fileInp')
const galleryBlock = document.querySelector('#galleryBlock')
const messageBlock = document.querySelector('#messageBlock')
const uploadBtn = document.querySelector('#uploadBtn')
const uploadBtnText = document.querySelector('#uploadText')
const uploadBtnSpinner = document.querySelector('#uploadSpinner')

let isWaiting = false

loadImages()

async function uploadFiles() {

    const files = fileInp.files
    if (files.length == 0 || isWaiting) return

    const formData = new FormData()

    Array.from(files).forEach(file => {
        formData.append('files', file)
    })

    setWaiting(true)

    const resp = await fetch('/image/upload', {
        method: 'POST',
        body: formData
    })
    const body = await resp.json()

    setWaiting(false)

    if (resp.ok) {
        Array.from(body.images).forEach(image_id => {
            addImage(image_id)
        })

        let message = `Загружено: <span class="green">${body.images.length}</span>`
        if (body.errors.length !== 0) {
            message += ` | <span class="red">${body.errors.length}</span>`
            body.errors.forEach(error => {
                message += `<br><span class="err">– ${error}</span>`
            })
        }
        messageBlock.innerHTML = message

    } else {
        messageBlock.innerHTML = '<span class="red">Ошибка загрузки файлов</span>'
    }
}

async function loadImages() {
    const resp = await fetch('/image/getAll', {
        method: 'POST'
    })
    const body = await resp.json()

    if (resp.ok) {
        Array.from(body).forEach(elem => {
            addImage(elem.img_id)
        })

    } else {
        messageBlock.innerHTML = '<span class="red">Ошибка загрузки файлов</span>'
    }
}

function addFiles() {
    if (fileInp.files.length == 0 || isWaiting) {
        return uploadBtn.classList.remove('allowed')
    }
    uploadBtn.classList.add('allowed')
}

function addImage(src) {
    const div = document.createElement('div')
    const img = document.createElement('img')
    img.src = `${window.location.origin}/image/${src}`
    div.appendChild(img)
    galleryBlock.prepend(div)
}

function setWaiting(waiting) {
    if (waiting) {
        isWaiting = true
        fileInp.value = ''
        addFiles()
        uploadBtnText.style.display = 'none'
        uploadBtnSpinner.style.display = 'block'

    } else {
        isWaiting = false
        addFiles()
        uploadBtnText.style.display = 'block'
        uploadBtnSpinner.style.display = 'none'
    }
}