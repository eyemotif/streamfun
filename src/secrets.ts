import { Result } from './utils'
import { existsSync, readFileSync } from 'fs'
import path from 'path'


export type Secrets = {
    publicPassword: string | undefined,
    privatePassword: string | undefined,
    publicPort: number,
    privatePort: number,
    pagePort: number,
}

export function getSecrets(): Secrets {
    const secretsPath = path.join(__dirname, '..', 'secret')
    let publicPassword, privatePassword, publicPort, privatePort, pagePort
    if (existsSync(path.join(secretsPath, 'public-password.txt'))) {
        publicPassword = readFileSync(path.join(secretsPath, 'public-password.txt'), 'utf8')
    }
    else publicPassword = undefined
    if (existsSync(path.join(secretsPath, 'private-password.txt'))) {
        privatePassword = readFileSync(path.join(secretsPath, 'private-password.txt'), 'utf8')
    }
    else privatePassword = undefined
    if (existsSync(path.join(secretsPath, 'public-port.txt'))) {
        publicPort = parseInt(readFileSync(path.join(secretsPath, 'public-port.txt'), 'utf8'))
    }
    else publicPort = 8080
    if (existsSync(path.join(secretsPath, 'private-port.txt'))) {
        privatePort = parseInt(readFileSync(path.join(secretsPath, 'private-port.txt'), 'utf8'))
    }
    else privatePort = 8000
    if (existsSync(path.join(secretsPath, 'page-port.txt'))) {
        pagePort = parseInt(readFileSync(path.join(secretsPath, 'page-port.txt'), 'utf8'))
    }
    else pagePort = 3000
    return { publicPassword, privatePassword, publicPort, privatePort, pagePort }
}
