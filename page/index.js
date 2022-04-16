const port = 8000
let socket

function interpretMessage(message) {
    const [task, ...args] = message.data.split(' ')
    const rawArgs = args.join(' ')

    switch (task) {
        case 'audio':
            if (args.length === 1) {
                const playElement = document.getElementById(`audio-${args[0]}`)
                if (playElement !== undefined) {
                    console.log(`Playing audio "${args[0]}"`)
                    playElement.play()
                }
            }
            break
        case 'audiovolume':
            if (args.length === 2) {
                const playElement = document.getElementById(`audio-${args[0]}`)
                const volume = parseFloat(args[1])
                if (playElement !== undefined && !isNaN(volume)) {
                    console.log(`Setting audio ${args[0]} to ${args[1]}`)
                    playElement.volume = parseFloat(args[1])
                }
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

function createAudioTag(file) {
    const componentName = removeFileExtension(file)

    let audioTag = document.createElement('audio')
    audioTag.id = `audio-${componentName}`
    let audioSource = document.createElement('source')
    audioSource.src = 'audio/' + file
    audioTag.appendChild(audioSource)

    audioTag.onended = () => socket.send(`end:audio:${componentName}`)

    return audioTag
}

function setResources(message) {
    console.log('...got components')

    const components = JSON.parse(message.data)

    let audioComponentDiv = document.getElementById('audio-components')
    for (const audioComponent of components['audio']) {
        audioComponentDiv.appendChild(createAudioTag(audioComponent))
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
    const location = window.location
    socket = new WebSocket(`ws://${location.hostname}:${port}`)

    socket.addEventListener('open', () => {
        console.log(`Connected to Streamfun server!`)
        loadResources()
    })
    socket.addEventListener('close', () => window.location.reload())

    // socket.addEventListener('message', message => console.log(`Got "${message.data}"`))
}

window.onload = () => {
    loadSockets()
}
