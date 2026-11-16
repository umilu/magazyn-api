import { parseId, readJsonBody, sendJson } from './http-utils.ts';
import http from 'node:http';
import { pool } from './db.ts';

export async function getProducts(req: http.IncomingMessage, res: http.ServerResponse) {
    const result = await pool.query('SELECT id, name, quantity FROM products ORDER BY id');
    sendJson(res, 200, result.rows);
}

export async function getProduct(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = parseId(req.url ?? '/');

    if (id === null) {
        sendJson(res, 400, { error: 'Invalid id' });
        return;
    }

    const result = await pool.query('SELECT id, name, quantity FROM products WHERE id = $1', [id]);

    if (result.rows[0]) {
        sendJson(res, 200, result.rows[0]);
        return;
    }

    sendJson(res, 404, { error: 'Product not found' });
}

export async function createProduct(req: http.IncomingMessage, res: http.ServerResponse) {
    const input = await readJsonBody(req, res);
    if (input === null) {
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

    try {
        const result = await pool.query(
            'INSERT INTO products (name, quantity) VALUES ($1, $2) RETURNING id, name, quantity',
            [input.name.trim(), input.quantity],
        );

        sendJson(res, 201, result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            sendJson(res, 409, { error: 'Product already exists' });
            return;
        }
        throw error;
    }
}

export async function updateProduct(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = parseId(req.url ?? '/');

    if (id === null) {
        sendJson(res, 400, { error: 'Invalid id' });
        return;
    }

    const input = await readJsonBody(req, res);

    if (input === null) {
        return;
    }

    if ('name' in input) {
        if (typeof input.name !== 'string' || input.name.trim() === '') {
            sendJson(res, 400, { error: 'Invalid name' });
            return;
        }
    }

    if ('quantity' in input) {
        if (!Number.isInteger(input.quantity) || input.quantity < 0) {
            sendJson(res, 400, { error: 'Invalid quantity' });
            return;
        }
    }

    const name = 'name' in input ? input.name.trim() : null;
    const quantity = 'quantity' in input ? input.quantity : null;

    try {
        const result = await pool.query(
            `UPDATE products
     SET name = COALESCE($1, name),
         quantity = COALESCE($2, quantity)
     WHERE id = $3
     RETURNING id, name, quantity`,
            [name, quantity, id],
        );
        if (!result.rows[0]) {
            sendJson(res, 404, { error: 'Product not found' });
            return;
        }

        sendJson(res, 200, result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            sendJson(res, 409, { error: 'Product already exists' });
            return;
        }
        throw error;
    }
}

export async function deleteProduct(req: http.IncomingMessage, res: http.ServerResponse) {
    const id = parseId(req.url ?? '/');

    if (id === null) {
        sendJson(res, 400, { error: 'Invalid id' });
        return;
    }

    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
        sendJson(res, 404, { error: 'Product not found' });
        return;
    }

    res.writeHead(204);
    res.end();
}
