import { readdirSync, readFileSync } from 'fs'

function getPath(path: string): string {
    return `${__dirname}/../${path}`
}

function getFile(path: string): string {
    return readFileSync(getPath(path), 'utf8')
}

export function getComponents(): Record<string, string[]> {
    let components: Record<string, string[]> = {
        'audio': []
    }

    components['audio'] =
        readdirSync(getPath('page/audio/'))
            .filter(path => path.endsWith('.mp3') || path.endsWith('.wav') || path.endsWith('.ogg'))

    return components
}
