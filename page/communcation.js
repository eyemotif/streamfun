const port = 8000

window.onload = () => {
    const socket = new WebSocket(`ws://localhost:${port}`)

    socket.addEventListener('open', () => {
        console.log(`Connected to Streamfun server!`)
    })

    socket.addEventListener('message', (message) => {
        console.log(`Got "${message.data}" from server!`)
    })
}
