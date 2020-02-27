export namespace Helpers {
    export function moveTowards(x1: number, y1: number, x2: number, y2: number, distance: number) {
        const vector = { x: x2 - x1, y: y2 - y1 };
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude === 0) {
            return { x: 0, y: 0 };
        }
        const normalized = { x: vector.x / magnitude, y: vector.y / magnitude };
        return { x: x1 + normalized.x * distance, y: y1 + normalized.y * distance };
    }

    export function distance(x1: number, y1: number, x2: number, y2: number) {
        return Math.abs(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
    }
}
