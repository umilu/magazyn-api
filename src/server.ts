import http from 'node:http';
import { sendJson } from './http-utils.ts';
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
} from './products-routes.ts';
import { matchPath, type Route } from './router.ts';

const routes: Route[] = [
    { method: 'GET', path: '/products', handler: getProducts },
    { method: 'GET', path: '/products/:id', handler: getProduct },
    { method: 'POST', path: '/products', handler: createProduct },
    { method: 'PATCH', path: '/products/:id', handler: updateProduct },
    { method: 'DELETE', path: '/products/:id', handler: deleteProduct },
];

const server = http.createServer((req, res) => {
    const route = routes.find((r) => r.method === req.method && matchPath(r.path, req.url ?? ''));
    if (route) {
        route.handler(req, res);
        return;
    }

    sendJson(res, 404, { error: 'Not found' });
});

server.listen(4000, 'localhost', () => {
    console.log('Server running at http://localhost:4000/');
});
