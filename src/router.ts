import http from 'node:http';

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void | Promise<void>;

export type Route = {
    method: string;
    path: string;
    handler: Handler;
};

export function matchPath(pattern: string, url: string): boolean {
    const patternChunks = pattern.split('/');
    const urlChunks = url.split('/');

    if (patternChunks.length !== urlChunks.length) {
        return false;
    }

    for (let i = 0; i < patternChunks.length; i++) {
        if (patternChunks[i].startsWith(':')) {
            continue;
        }
        if (patternChunks[i] !== urlChunks[i]) {
            return false;
        }
    }

    return true;
}
