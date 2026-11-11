import http from 'node:http';

export function sendJson(res: http.ServerResponse, status: number, data: unknown) {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(data));
}

export function readJsonBody(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    onDone: (input: any) => void,
) {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
        chunks.push(chunk);
    });
    req.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        let input;
        try {
            input = JSON.parse(body);
        } catch {
            sendJson(res, 400, { error: 'Invalid JSON' });
            return;
        }
        if (typeof input !== 'object' || input === null) {
            sendJson(res, 400, { error: 'Body must be an object' });
            return;
        }
        onDone(input);
    });
}

export function parseId(url: string) {
    const id = Number(url.split('/')[2]);
    if (Number.isInteger(id) && id > 0) {
        return id;
    } else {
        return null;
    }
}
