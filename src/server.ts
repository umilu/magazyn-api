import http from 'node:http';

type Product = {
    id: number;
    name: string;
    quantity: number;
};

const products: Product[] = [
    { id: 1, name: 'Krzesło', quantity: 5 },
    { id: 2, name: 'Stół', quantity: 15 },
    { id: 3, name: 'Kanapa', quantity: 50 },
];

let nextId = 4;

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/products') {
        sendJson(res, 200, products);
        return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/products/')) {
        const id = Number(req.url.split('/')[2]);

        if (!(Number.isInteger(id) && id > 0)) {
            sendJson(res, 400, { error: 'Invalid id' });
            return;
        }

        const product = products.find((p) => p.id === id);

        if (product) {
            sendJson(res, 200, product);
            return;
        }
        if (!product) {
            sendJson(res, 404, { error: 'Product not found' });
            return;
        }
    }

    if (req.method === 'POST' && req.url === '/products') {
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
            if (typeof input.name !== 'string' || input.name.trim() === '') {
                sendJson(res, 400, { error: 'Invalid name' });
                return;
            }
            if (!Number.isInteger(input.quantity) || input.quantity < 0) {
                sendJson(res, 400, { error: 'Invalid quantity' });
                return;
            }
            if (products.some((p) => input.name.trim().toLowerCase() === p.name.toLowerCase())) {
                sendJson(res, 409, { error: 'Product already exists' });
                return;
            }

            const newProduct: Product = {
                id: nextId++,
                name: input.name.trim(),
                quantity: input.quantity,
            };
            products.push(newProduct);
            sendJson(res, 201, newProduct);
        });
        return;
    }

    if (req.method === 'PATCH' && req.url?.startsWith('/products/')) {
        const id = Number(req.url.split('/')[2]);

        if (!(Number.isInteger(id) && id > 0)) {
            sendJson(res, 400, { error: 'Invalid id' });
            return;
        }
        const product = products.find((p) => p.id === id);

        if (!product) {
            sendJson(res, 404, { error: 'Product not found' });
            return;
        }
        const newProduct: Product = { ...product };
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
            if ('name' in input) {
                if (typeof input.name !== 'string' || input.name.trim() === '') {
                    sendJson(res, 400, { error: 'Invalid name' });
                    return;
                }
                if (
                    products.some((p) => {
                        return (
                            input.name.trim().toLowerCase() === p.name.toLowerCase() && p.id !== id
                        );
                    })
                ) {
                    sendJson(res, 409, { error: 'Product already exists' });
                    return;
                }
                newProduct.name = input.name.trim();
            }
            if ('quantity' in input) {
                if (!Number.isInteger(input.quantity) || input.quantity < 0) {
                    sendJson(res, 400, { error: 'Invalid quantity' });
                    return;
                }
                newProduct.quantity = input.quantity;
            }
            const index = products.findIndex((p) => p.id === id);
            products[index] = newProduct;
            sendJson(res, 200, newProduct);
        });
        return;
    }
    if (req.method === 'DELETE' && req.url?.startsWith('/products/')) {
        const id = Number(req.url.split('/')[2]);

        if (!(Number.isInteger(id) && id > 0)) {
            sendJson(res, 400, { error: 'Invalid id' });
            return;
        }
        const index = products.findIndex((p) => id === p.id);

        if (index === -1) {
            sendJson(res, 404, { error: 'Product not found' });
            return;
        }
        products.splice(index, 1);
        res.writeHead(204);
        res.end();
        return;
    }

    sendJson(res, 404, { error: 'Not found' });
});

server.listen(4000, 'localhost', () => {
    console.log('Server running at http://localhost:4000/');
});
