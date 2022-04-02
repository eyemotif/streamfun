import express from 'express'
import { Server } from './communication'
import { getSecrets } from './secrets'
import { WebSocketServer } from 'ws'

const secrets = getSecrets()

const privateServer = new WebSocketServer({ port: secrets.privatePort })
privateServer.once('listening', () => console.log(`Browser source socket is listening on ws://localhost:${secrets.privatePort}`))
privateServer.on('message', message => console.log(`Got message from browser source socket: ${message.data}`))

const browserSource = express()
browserSource.use(express.static(__dirname + '/../page'))

browserSource.get('/', (_, res) => res.send('index.html'))
browserSource.listen(secrets.pagePort, () => console.log(`Browser source hosted at: localhost:${secrets.pagePort}`))
