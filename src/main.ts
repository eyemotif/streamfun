import express from 'express'
import { Server } from './communication'
import { getSecrets } from './secrets'

const secrets = getSecrets()

const privateServer = new Server('private server', secrets.privatePort, undefined)

const browserSource = express()
browserSource.use(express.static(__dirname + '/../page'))

browserSource.get('/', (_, res) => res.send('index.html'))
browserSource.listen(secrets.pagePort, () => console.log(`Browser source hosted at: localhost:${secrets.pagePort}`))
