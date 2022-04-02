const port = 8000
const password = undefined

window.onload = () => {
    const socket = new WebSocket(`ws://localhost:${port}`)

    socket.addEventListener('open', () => {
        console.log(`Connected to Streamfun server!`)
        if (password !== undefined)
            socket.send(`auth ${password}`)
    })

    socket.addEventListener('message', (message) => {
        console.log(`Got "${message.data}" from server!`)
    })
}
