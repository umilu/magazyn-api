import { parseId } from './http-utils.ts';
import type { Request, Response } from 'express';
import { pool } from './db.ts';

export async function getProducts(req: Request, res: Response) {
    const result = await pool.query('SELECT id, name, quantity FROM products ORDER BY id');
    res.json(result.rows);
}

export async function getProduct(req: Request, res: Response) {
    const id = parseId(req.params.id);

    if (id === null) {
        res.status(400).json({ error: 'Invalid id' });
        return;
    }

    const result = await pool.query('SELECT id, name, quantity FROM products WHERE id = $1', [id]);

    if (result.rows[0]) {
        res.json(result.rows[0]);
        return;
    }

    res.status(404).json({ error: 'Product not found' });
}

export async function createProduct(req: Request, res: Response) {
    const input = req.body;
    if (typeof input !== 'object' || input === null) {
        res.status(400).json({ error: 'Body must be an object' });
        return;
    }

    if (typeof input.name !== 'string' || input.name.trim() === '') {
        res.status(400).json({ error: 'Invalid name' });
        return;
    }
    if (!Number.isInteger(input.quantity) || input.quantity < 0) {
        res.status(400).json({ error: 'Invalid quantity' });
        return;
    }

    try {
        const result = await pool.query(
            'INSERT INTO products (name, quantity) VALUES ($1, $2) RETURNING id, name, quantity',
            [input.name.trim(), input.quantity],
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ error: 'Product already exists' });
            return;
        }
        throw error;
    }
}

export async function updateProduct(req: Request, res: Response) {
    const id = parseId(req.params.id);
    const input = req.body;

    if (id === null) {
        res.status(400).json({ error: 'Invalid id' });
        return;
    }

    if (typeof input !== 'object' || input === null) {
        res.status(400).json({ error: 'Body must be an object' });
        return;
    }

    if ('name' in input) {
        if (typeof input.name !== 'string' || input.name.trim() === '') {
            res.status(400).json({ error: 'Invalid name' });

            return;
        }
    }

    if ('quantity' in input) {
        if (!Number.isInteger(input.quantity) || input.quantity < 0) {
            res.status(400).json({ error: 'Invalid quantity' });
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
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(409).json({ error: 'Product already exists' });
            return;
        }
        throw error;
    }
}

export async function deleteProduct(req: Request, res: Response) {
    const id = parseId(req.params.id);

    if (id === null) {
        res.status(400).json({ error: 'Invalid id' });
        return;
    }

    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
    }

    res.status(204).end();
}
