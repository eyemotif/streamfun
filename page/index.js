const port = 8000
let socket

function interpretMessage(data) {
    console.log(`Got message: ${data}`)
}

function removeFileExtension(filepath) {
    let split = filepath.split('.')
    split.pop()
    return split.join('.')
}

function setResources(message) {
    const components = JSON.parse(message.data)
    let audioComponentDiv = document.getElementById('audio-components')
    for (const audioComponent of components['audio']) {
        let audioTag = document.createElement('audio')
        audioTag.id = `audio-${removeFileExtension(audioComponent)}`
        let audioSource = document.createElement('source')
        audioSource.src = 'audio/' + audioComponent
        audioTag.appendChild(audioSource)
        audioComponentDiv.appendChild(audioTag)
    }
    socket.removeEventListener('message', this)
    socket.addEventListener('message', interpretMessage)
}

async function loadResources() {
    console.log('asking for components...')
    socket.send('components')
    socket.addEventListener('message', setResources)
}

async function loadSockets() {
    socket = new WebSocket(`ws://localhost:${port}`)

    socket.addEventListener('open', () => {
        console.log(`Connected to Streamfun server!`)
        loadResources()
    })
}

window.onload = () => {
    loadSockets()
}
