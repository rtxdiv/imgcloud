const fileInp = document.querySelector('#fileInp')
const galleryBlock = document.querySelector('#galleryBlock')
const messageBlock = document.querySelector('#messageBlock')
const uploadBtn = document.querySelector('#uploadBtn')
const uploadBtnText = document.querySelector('#uploadText')
const uploadBtnSpinner = document.querySelector('#uploadSpinner')
const popup = document.querySelector('#popup')
const popupImg = document.querySelector('#popupImg')
const copyInp = document.querySelector('#copyInp')

let isWaiting = false
let img_id
let imgElem
popup.addEventListener('click', popupClose)

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
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
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

function addImage(id) {
    const div = document.createElement('div')
    const img = document.createElement('img')
    img.src = `${window.location.origin}/image/${id}`
    img.dataset.img_id = id
    img.addEventListener('click', popupOpen)
    div.appendChild(img)
    galleryBlock.prepend(div)
}
function removeImage() {
    imgElem.parentNode.remove()
    popupClose()
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

function popupOpen(event) {
    imgElem = event.target
    const src = imgElem.src
    const id = imgElem.dataset.img_id
    popupImg.src = src
    copyInp.value = src
    img_id = id
    popup.style.display = 'flex'
    document.body.style.overflow = 'hidden'
}
function popupClose(event = null) {
    if (event) {
        if (event.target !== copyInp) window.getSelection().removeAllRanges()
        if (event.target !== popup) return
    }
    popup.style.display = 'none'
    document.body.style.overflow = 'auto'
}

function selectAll() {
    copyInp.select()
}

async function deleteImg() {
    const resp = await fetch('/image/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            img_id: img_id
        })
    })

    if (resp.ok) {
        messageBlock.innerHTML = ''
        removeImage()

    } else {
        messageBlock.innerHTML = '<span class="red">Ошибка удаления файла</span>'
        popupClose()
    }
}