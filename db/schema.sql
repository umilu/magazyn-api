-- Schemat bazy magazyn_api
DROP TABLE IF EXISTS products;

CREATE TABLE
    products (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL CHECK (TRIM(name) <> '') CHECK (name = TRIM(name)),
        quantity INTEGER NOT NULL CHECK (quantity >= 0)
    );

CREATE UNIQUE INDEX products_name_unique ON products (lower(name));

INSERT INTO
    products (name, quantity)
VALUES
    ('Krzesło', 5),
    ('Stół', 15),
    ('Kanapa', 50);