import { readFileSync } from 'fs'
import { WebSocketServer } from 'ws'
import { ServerClient } from './communication'
import { getComponents } from './components'

function broadcast(server: WebSocketServer, message: string) {
    server.clients.forEach(socket => socket.send(message))
}

function removeFileExtension(filepath: string) {
    let split = filepath.split('.')
    split.pop()
    return split.join('.')
}

export function publicServerHandler(privateServer: WebSocketServer) {
    const MAX_QUEUE_LEN = 10
    // [request][word][multi]
    const queues: Record<string, string[][][]> = {
        audio: []
    }

    /*
        General guide for private task names:
        - The default task for a component is the name of the component type.
        - Any other tasks are formatted as <component-type><action>.
        
        Any communication from the app to the private server is formatted as:
        <event>:<component-type>:<component-name>.
    */

    privateServer.on('connection', socket => {
        socket.on('message', data => {
            const message = data.toString()
            if (message === 'components') {
                socket.send(JSON.stringify(getComponents()))
            }
            else if (message.startsWith('end:')) {
                const [_, componentType, component] = message.split(':')

                const current = queues[componentType][0][0]
                const removePos = current.indexOf(component)

                if (removePos < 0) throw `Unknown ${componentType} component "${component}"`

                current.splice(removePos, 1)
                if (current.length === 0) {
                    queues[componentType][0].shift()
                    if (queues[componentType][0].length > 0)
                        for (const component of queues[componentType][0][0])
                            broadcast(privateServer, `${componentType} ${component}`)
                    else {
                        queues[componentType].shift()
                        if (queues[componentType].length > 0)
                            for (const component of queues[componentType][0][0])
                                broadcast(privateServer, `${componentType} ${component}`)
                    }
                }
                else queues[componentType][0][0] = current
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

            // default media tasks
            case 'audio':
                if (args.length >= 1) {
                    const components =
                        getComponents()[task]
                            .map((component: string) => removeFileExtension(component))

                    const newQueue = args
                        .map(str => str.split(':'))
                        .map(multi => multi.reduce<string[]>((acc, i) => {
                            const copy = acc
                            if (!acc.includes(i) && components.includes(i)) copy.push(i)
                            return copy
                        }, []))
                        .filter(multi => multi.length > 0)

                    if (newQueue.length > MAX_QUEUE_LEN)
                        newQueue.splice(MAX_QUEUE_LEN)
                    if (newQueue.length > 0)
                        queues[task].push(newQueue)

                    if (queues[task].length === 1) {
                        for (const component of queues[task][0][0])
                            broadcast(privateServer, `${task} ${component}`)
                    }
                }
                else client.error(`Invalid number of arguments for task "${task}".`)
                break

            // other media tasks
            case 'volume':
                if (args.length === 2) broadcast(privateServer, `audiovolume ${args[0]} ${args[1]}`)
                else client.error(`Invalid number of arguments for task "${task}".`)
                break

            // internal tasks
            case 'flush':
                if (args.length === 1) queues[args[0]] = []
                else client.error(`Invalid number of arguments for task "${task}".`)
                break
            case 'components':
                let componentNames: Record<string, string[]> = {}
                const components = getComponents()
                for (const componentType in components)
                    componentNames[componentType] = components[componentType]
                        .map((component: string) => removeFileExtension(component))
                client.send(JSON.stringify(componentNames))
                break
            default:
                client.error(`Invalid task.`)
                break
        }
    }
}
