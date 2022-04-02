import express from 'express'
import { getSecrets } from './secrets'

const secrets = getSecrets()

const browserSource = express()
browserSource.use(express.static(__dirname + '/../page'))

browserSource.get('/', (_, res) => res.send('index.html'))
browserSource.listen(secrets.pagePort, () => console.log(`Browser source hosted at: localhost:${secrets.pagePort}`))
