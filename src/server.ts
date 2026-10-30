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

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(4000, 'localhost', () => {
    console.log('Server running at http://localhost:4000/');
});
