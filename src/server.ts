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

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/products') {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(products));

        return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/products/')) {
        const id = Number(req.url.split('/')[2]);

        if (!(Number.isInteger(id) && id > 0)) {
            res.writeHead(400, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid id' }));
            return;
        }

        const product = products.find((p) => p.id === id);

        if (product) {
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify(product));
            return;
        }
        if (!product) {
            res.writeHead(404, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
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
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }
            if (typeof input !== 'object' || input === null) {
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: 'Body must be an object' }));
                return;
            }
            if (typeof input.name !== 'string' || input.name.trim() === '') {
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid name' }));
                return;
            }
            if (!Number.isInteger(input.quantity) || input.quantity < 0) {
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid quantity' }));
                return;
            }
            if (products.some((p) => input.name.trim().toLowerCase() === p.name.toLowerCase())) {
                res.writeHead(409, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: 'Product already exists' }));
                return;
            }

            const newProduct: Product = {
                id: nextId++,
                name: input.name.trim(),
                quantity: input.quantity,
            };
            products.push(newProduct);
            res.writeHead(201, { 'content-type': 'application/json' });
            res.end(JSON.stringify(newProduct));
        });
        return;
    }

    if (req.method === 'PATCH' && req.url?.startsWith('/products/')) {
        const id = Number(req.url.split('/')[2]);

        if (!(Number.isInteger(id) && id > 0)) {
            res.writeHead(400, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid id' }));
            return;
        }
        const product = products.find((p) => p.id === id);

        if (!product) {
            res.writeHead(404, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
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
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
            }
            if (typeof input !== 'object' || input === null) {
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(JSON.stringify({ error: 'Body must be an object' }));
                return;
            }
            if ('name' in input) {
                if (typeof input.name !== 'string' || input.name.trim() === '') {
                    res.writeHead(400, { 'content-type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid name' }));
                    return;
                }
                if (
                    products.some((p) => {
                        return (
                            input.name.trim().toLowerCase() === p.name.toLowerCase() && p.id !== id
                        );
                    })
                ) {
                    res.writeHead(409, { 'content-type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Product already exists' }));
                    return;
                }
                newProduct.name = input.name.trim();
            }
            if ('quantity' in input) {
                if (!Number.isInteger(input.quantity) || input.quantity < 0) {
                    res.writeHead(400, { 'content-type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid quantity' }));
                    return;
                }
                newProduct.quantity = input.quantity;
            }
            const index = products.findIndex((p) => p.id === id);
            products[index] = newProduct;
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify(newProduct));
        });
        return;
    }
    if (req.method === 'DELETE' && req.url?.startsWith('/products/')) {
        const id = Number(req.url.split('/')[2]);

        if (!(Number.isInteger(id) && id > 0)) {
            res.writeHead(400, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid id' }));
            return;
        }
        const index = products.findIndex((p) => id === p.id);

        if (index === -1) {
            res.writeHead(404, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ error: 'Product not found' }));
            return;
        }
        products.splice(index, 1);
        res.writeHead(204);
        res.end();
        return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(4000, 'localhost', () => {
    console.log('Server running at http://localhost:4000/');
});
