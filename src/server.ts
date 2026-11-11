import http from 'node:http';
import { products, getNextId, type Product } from './products.ts';
import { readJsonBody, sendJson, parseId } from './http-utils.ts';

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/products') {
        sendJson(res, 200, products);
        return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/products/')) {
        const id = parseId(req.url);

        if (id === null) {
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
        readJsonBody(req, res, (input) => {
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
                id: getNextId(),
                name: input.name.trim(),
                quantity: input.quantity,
            };
            products.push(newProduct);
            sendJson(res, 201, newProduct);
        });
        return;
    }

    if (req.method === 'PATCH' && req.url?.startsWith('/products/')) {
        const id = parseId(req.url);

        if (id === null) {
            sendJson(res, 400, { error: 'Invalid id' });
            return;
        }

        const product = products.find((p) => p.id === id);

        if (!product) {
            sendJson(res, 404, { error: 'Product not found' });
            return;
        }

        readJsonBody(req, res, (input) => {
            const newProduct: Product = { ...product };

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
        const id = parseId(req.url);

        if (id === null) {
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
