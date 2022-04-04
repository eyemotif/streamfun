import express from 'express'
import { Server } from './communication'
import { getSecrets } from './secrets'
import { WebSocketServer } from 'ws'
import { readFileSync } from 'fs'
import { publicServerHandler } from './public-server'

const secrets = getSecrets()

const privateServer = new WebSocketServer({ port: secrets.privatePort })
privateServer.once('listening', () => console.log(`Browser source socket is listening on ws://localhost:${secrets.privatePort}`))
privateServer.on('connection', socket => {
    socket.on('message', data => {
        switch (data.toString()) {
            case 'components':
                let components = JSON.parse(readFileSync(__dirname + '/../components.json', 'utf8'))
                socket.send(JSON.stringify(components))
                break
            default: console.log(`Got message from browser source socket: ${data}`)
        }
    })

})

const publicServer = new Server('public server', secrets.publicPort, secrets.publicPassword)
publicServer.setInterpreter(publicServerHandler(privateServer))

const browserSource = express()
browserSource.use(express.static(__dirname + '/../page'))

browserSource.get('/', (_, res) => res.send('index.html'))
browserSource.listen(secrets.pagePort, () => console.log(`Browser source hosted at: localhost:${secrets.pagePort}`))
