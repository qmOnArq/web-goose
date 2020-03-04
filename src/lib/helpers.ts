export namespace Helpers {
    export function moveTowards(x1: number, y1: number, x2: number, y2: number, distance: number) {
        if (x2 == x1 && y2 == y1) {
            return { x: x2, y: y2 };
        }

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

    export function randomPointOnRect(x: number, y: number, width: number, height: number) {
        let p = Math.random() * (width * 2 + height * 2);
        const result = { x: 0, y: 0 };

        if (p < width + height) {
            if (p < width) {
                result.x = p;
                result.y = y;
            } else {
                result.x = width;
                result.y = p - width;
            }
        } else {
            p = p - (width + height);
            if (p < width) {
                result.x = width - p;
                result.y = height;
            } else {
                result.x = x;
                result.y = height - (p - width);
            }
        }
        return result;
    }

    export function getViewportWithPadding(xPadding = 0, yPadding = 0) {
        return {
            top: window.pageYOffset + xPadding,
            left: window.pageXOffset + yPadding,
            height: Math.max(0, window.innerHeight - xPadding * 2),
            width: Math.max(0, window.innerWidth - yPadding * 2),
        };
    }

    export function isPointInRect(
        x: number,
        y: number,
        rect: { top: number; left: number; height: number; width: number },
    ) {
        return x >= rect.left && y >= rect.top && x <= rect.left + rect.width && y <= rect.top + rect.height;
    }

    export function isPointInViewportWithPadding(x: number, y: number, xPadding = 0, yPadding = 0) {
        return isPointInRect(x, y, getViewportWithPadding(xPadding, yPadding));
    }

    export function angle(x1: number, y1: number, x2: number, y2: number) {
        const direction = { x: x2 - x1, y: y2 - y1 };
        return (Math.atan2(direction.y, direction.x) * 180) / Math.PI;
    }
}
