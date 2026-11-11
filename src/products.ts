export type Product = {
    id: number;
    name: string;
    quantity: number;
};

export const products: Product[] = [
    { id: 1, name: 'Krzesło', quantity: 5 },
    { id: 2, name: 'Stół', quantity: 15 },
    { id: 3, name: 'Kanapa', quantity: 50 },
];

let nextId = 4;

export function getNextId() {
    return nextId++;
}
