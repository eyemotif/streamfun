import { readFileSync } from 'fs'
import { WebSocketServer } from 'ws'
import { ServerClient } from './communication'

function broadcast(server: WebSocketServer, message: string) {
    server.clients.forEach(socket => socket.send(message))
}

function removeFileExtension(filepath: string) {
    let split = filepath.split('.')
    split.pop()
    return split.join('.')
}

export function publicServerHandler(privateServer: WebSocketServer) {
    const MAX_QUEUE_LEN = 20
    // [user][arg][multi]
    const queues: Record<string, string[][][]> = {
        audio: []
    }

    /*
        General guide for private task names:
        - The default task for a component is the name of the component type.
        - Any other tasks are formatted as <component-type><action>.
        
        Any communication to the private server is formatted as:
        <event>:<component-type>:<component-name>.
    */

    privateServer.on('connection', socket => {
        socket.on('message', data => {
            const message = data.toString()
            if (message === 'components') {
                let components = JSON.parse(readFileSync(__dirname + '/../components.json', 'utf8'))

                socket.send(JSON.stringify(components))
            }
            else if (message.startsWith('end:')) {
                const [_, componentType, component] = message.split(':')

                const current = queues[componentType][0][0]
                const removePos = current.indexOf(component)

                if (removePos >= 0) {
                    current.splice(removePos, 1)
                    if (current.length === 0) {
                        queues[componentType][0].shift()
                        if (queues[componentType][0].length > 0)
                            for (const component of queues[componentType][0][0])
                                broadcast(privateServer, `${componentType} ${component}`)
                        else queues[componentType].shift()
                    }
                    else queues[componentType][0][0] = current
                }
                else throw `Unknown ${componentType} component "${component}"`
            }
            else console.log(`Got message from browser source socket: ${message}`)
        })
    })

    return function (client: ServerClient, message: string) {
        const [task, ...args] = message.split(' ')
        const rawArgs = args.join(' ')
        const server = client.getServer()

        if (task !== 'password' && !client.isAuthorized()) {
            client.error('Client not authorized.')
            return
        }

        switch (task) {
            case 'password':
                if (server.testPassword(rawArgs)) {
                    if (!client.authorize())
                        client.error('Client already authorized.')
                }
                else client.error('Incorrect password.')
                break
            // default actions
            case 'audio':
                if (args.length >= 1) {
                    queues[task].push(args.map(str => str.split(':')))
                    if (queues[task][queues[task].length - 1].length > MAX_QUEUE_LEN) {
                        queues[task][queues[task].length - 1].splice(MAX_QUEUE_LEN)
                    }

                    if (queues[task].length === 1) {
                        for (const component of queues[task][0][0])
                            broadcast(privateServer, `${task} ${component}`)
                    }
                }
                else client.error(`Invalid number of arguments for task "${task}".`)
                break
            case 'volume':
                if (args.length === 2) broadcast(privateServer, `audiovolume ${args[0]} ${args[1]}`)
                else client.error('Invalid number of arguments for task "volume".')
                break
            default: client.error(`Invalid task.`)
        }
    }
}
