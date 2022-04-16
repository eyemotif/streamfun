import { WebSocket, WebSocketServer } from 'ws'

export class ServerClient {
    private socket: WebSocket
    private server: Server
    private auth: boolean
    public Errors: number = 0

    public constructor(server: Server, socket: WebSocket, authorized: boolean) {
        this.server = server
        this.socket = socket
        this.auth = authorized

        this.socket.on('message', data => this.server.interpreter(this, data.toString()))
        this.socket.on('close', () => this.server.removeClient(this))
    }

    public error(message: string) {
        this.socket.send(`ERROR: ${message}`)
        if (++this.Errors === 3) this.socket.close(1002, 'Dropped')
    }

    public authorize(): boolean {
        if (this.auth) return false
        else {
            this.auth = true
            return true
        }
    }

    public getServer(): Server { return this.server }
    public send(data: string) { this.socket.send(data) }
    public isAuthorized(): boolean { return this.auth }
    public getSocket(): WebSocket { return this.socket }
}

export class Server {
    private name: string
    private webSocketServer: WebSocketServer
    private password: string | undefined
    private clients: ServerClient[] = []
    public interpreter: (client: ServerClient, message: string) => void = () => { }

    public constructor(name: string, port: number, password: string | undefined) {
        this.name = name
        this.webSocketServer = new WebSocketServer({ port })
        this.password = password

        this.webSocketServer.once('listening', () => console.log(`Server "${this.name}" is listening on port ${port}.`))
        this.webSocketServer.on('connection', clientSocket => {
            console.log(`Client ${this.clients.length} connected.`)
            this.clients.push(new ServerClient(this, clientSocket, password === undefined))
        })
    }

    public setInterpreter(interpreter: (client: ServerClient, message: string) => void) {
        this.interpreter = interpreter
    }

    public removeClient(client: ServerClient) {
        const index = this.clients.indexOf(client)
        console.log(`Dropping client ${index}...`)
        this.clients.splice(index, 1)
        setTimeout(() => {
            client.getSocket().terminate()
            console.log(`Client ${index} dropped.`)
        }, 1000)
    }

    public testPassword(input: string) { return input === this.password }
}
