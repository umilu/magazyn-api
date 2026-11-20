export function parseId(id: string | string[]) {
    const newId = Number(id);
    if (Number.isInteger(newId) && newId > 0) {
        return newId;
    } else {
        return null;
    }
}
