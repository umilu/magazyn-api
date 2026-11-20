import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from './products-routes.ts';
import type { ErrorRequestHandler } from 'express';
import express from 'express';

const app = express();

app.use(express.json());
app.post('/products', createProduct);
app.get('/products', getProducts);
app.get('/products/:id', getProduct);
app.patch('/products/:id', updateProduct);
app.delete('/products/:id', deleteProduct);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        res.status(400).json({ error: 'Invalid JSON' });
        return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);

app.listen(4000, 'localhost', () => {
    console.log('Server running at http://localhost:4000/');
});
