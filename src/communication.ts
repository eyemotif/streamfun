import { WebSocket, WebSocketServer } from 'ws'

class ServerClient {
    private server: Server
    private socket: WebSocket
    private auth: boolean
    public Errors: number = 0

    public constructor(server: Server, socket: WebSocket, authorized: boolean) {
        this.server = server
        this.socket = socket
        this.auth = authorized

        this.socket.on('message', data => {
            if (this.auth)
                this.server.interpretMessage(this, data.toString())
            else this.error('You are not authorized!')
        })
    }

    private error(message: string) {
        this.socket.send(`ERROR: ${message}`)
        if (++this.Errors === 3) this.server.removeClient(this)
    }

    public authorize(): boolean {
        if (this.auth) return false
        else {
            this.auth = true
            return true
        }
    }
}

export class Server {
    private name: string
    private webSocketServer: WebSocketServer
    private password: string | undefined
    private clients: ServerClient[] = []

    public constructor(name: string, port: number, password: string | undefined) {
        this.name = name
        this.webSocketServer = new WebSocketServer({ port })
        this.password = password

        this.webSocketServer.once('listening', () => console.log(`Server "${this.name}" is listening on port ${port}.`))
        this.webSocketServer.on('connection', clientSocket => {
            this.clients.push(new ServerClient(this, clientSocket, password === undefined))
        })
    }

    public interpretMessage(client: ServerClient, message: string) {
        console.debug(`MESSAGE RECEIVED IN ${this.name}: ${message}`)
    }

    public removeClient(client: ServerClient) {

    }
}
