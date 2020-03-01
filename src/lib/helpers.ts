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

    export function clamp(value: number, min: number, max: number) {
        return Math.min(max, Math.max(min, value));
    }

    export function randomItem<T>(array: T[] | ReadonlyArray<T>) {
        return array[Math.floor(Math.random() * array.length)];
    }

    export function getViewportWithPadding(padding = 0) {
        return {
            top: window.pageYOffset + padding,
            left: window.pageXOffset + padding,
            height: window.innerHeight - padding * 2,
            width: window.innerWidth - padding * 2,
        };
    }

    export function isPointInRect(
        x: number,
        y: number,
        rect: { top: number; left: number; height: number; width: number },
    ) {
        return x >= rect.left && y >= rect.top && x <= rect.left + rect.width && y <= rect.top + rect.height;
    }

    export function isPointInViewportWithPadding(x: number, y: number, padding = 0) {
        return isPointInRect(x, y, getViewportWithPadding(padding));
    }
}
