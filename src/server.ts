import http from 'node:http';
import { sendJson } from './http-utils.ts';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
} from './products-routes.ts';

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/products') {
        getProducts(req, res);
        return;
    }

    if (req.method === 'GET' && req.url?.startsWith('/products/')) {
        getProduct(req, res);
        return;
    }

    if (req.method === 'POST' && req.url === '/products') {
        createProduct(req, res);
        return;
    }

    if (req.method === 'PATCH' && req.url?.startsWith('/products/')) {
        updateProduct(req, res);
        return;
    }
    if (req.method === 'DELETE' && req.url?.startsWith('/products/')) {
        deleteProduct(req, res);
        return;
    }

    sendJson(res, 404, { error: 'Not found' });
});

server.listen(4000, 'localhost', () => {
    console.log('Server running at http://localhost:4000/');
});
