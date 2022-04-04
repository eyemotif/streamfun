import { WebSocketServer } from 'ws'
import { ServerClient } from './communication'

function broadcast(server: WebSocketServer, message: string) {
    server.clients.forEach(socket => socket.send(message))
}

export function publicServerHandler(privateServer: WebSocketServer) {
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
            case 'audio':
                if (args.length === 1)
                    broadcast(privateServer, `audio ${args[0]}`)
                else client.error('Invalid number of arguments for task "audio".')
                break
            case 'volume':
                if (args.length === 2) broadcast(privateServer, `audiovolume ${args[0]} ${args[1]}`)
                else client.error('Invalid number of arguments for task "volume".')
                break
            default: client.error(`Invalid task.`)
        }
    }
}
