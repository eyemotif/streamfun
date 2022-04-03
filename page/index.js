const port = 8000
let socket

function interpretMessage(message) {
    const [task, ...args] = message.data.split(' ')
    const rawArgs = args.join(' ')

    switch (task) {
        case 'audio':
            if (args.length === 1) {
                const playElement = document.getElementById(`audio-${args[0]}`)
                playElement.play()
            }
            break
        default: break
    }
}

function removeFileExtension(filepath) {
    let split = filepath.split('.')
    split.pop()
    return split.join('.')
}

function setResources(message) {
    console.log('...got components')

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
    socket.removeEventListener('message', setResources)
    socket.addEventListener('message', interpretMessage)
}

async function loadResources() {
    console.log('Asking for components...')
    socket.send('components')
    socket.addEventListener('message', setResources)
}

async function loadSockets() {
    socket = new WebSocket(`ws://localhost:${port}`)

    socket.addEventListener('open', () => {
        console.log(`Connected to Streamfun server!`)
        loadResources()
    })

    socket.addEventListener('message', message => console.log(`Got "${message.data}"`))
}

window.onload = () => {
    loadSockets()
}
