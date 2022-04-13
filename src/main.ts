import express from 'express'
import { Server } from './communication'
import { getSecrets } from './secrets'
import { WebSocketServer } from 'ws'
import { publicServerHandler } from './server'

const secrets = getSecrets()

const privateServer = new WebSocketServer({ port: secrets.privatePort })

const publicServer = new Server('public server', secrets.publicPort, secrets.publicPassword)
publicServer.setInterpreter(publicServerHandler(privateServer))

const browserSource = express()
browserSource.use(express.static(__dirname + '/../page'))

browserSource.get('/', (_, res) => res.send('index.html'))
browserSource.listen(secrets.pagePort, () => console.log(`Browser source hosted at: localhost:${secrets.pagePort}`))
