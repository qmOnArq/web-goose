import { GooseDrawing } from './goose-drawing';
import { getHeads } from './goose-heads';
import { getBodies } from './goose-bodies';
import { getWings } from './goose-wings';

export namespace Testing {
    export function init() {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = 1600;
        canvas.height = 1500;
        canvas.style.background = 'black';
        canvas.style.position = 'absolute';
        canvas.style.left = '5px';
        canvas.style.top = '5px';

        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;

        const mirrored = false;

        const bodies = getBodies();
        const wings = getWings();
        const heads = getHeads();

        for (let i = 0; i < heads.length; i++) {
            GooseDrawing.drawHead(ctx, heads[i], 20 + (16 + 1) * 3 * i, 100, 3, mirrored);
        }

        for (let i = 0; i < wings.length; i++) {
            GooseDrawing.drawWings(ctx, wings[i], bodies.standing[0], 500 + i * 150, 350, 3, mirrored);
        }

        const wingsIndex = 3;

        for (let i = 0; i < bodies.standing.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.standing[i], 40 + 30 * 3 * i, 200, 3, mirrored);
            for (let j = 0; j < heads.length; j++) {
                GooseDrawing.drawWings(ctx, wings[wingsIndex], bodies.standing[i], 40 + j * 100, 550, 3, mirrored);
                GooseDrawing.drawGoose(ctx, bodies.standing[i], heads[j], 40 + j * 100, 550, 3, mirrored);
            }
        }

        for (let i = 0; i < bodies.walking.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.walking[i], 40 + 30 * 3 * i, 300, 3, mirrored);
            for (let j = 0; j < heads.length; j++) {
                GooseDrawing.drawWings(ctx, wings[wingsIndex], bodies.walking[i], 40 + j * 100, 700 + 100 * i, 3, mirrored);
                GooseDrawing.drawGoose(ctx, bodies.walking[i], heads[j], 40 + j * 100, 700 + 100 * i, 3, mirrored);
            }
        }

        for (let i = 0; i < bodies.running.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.running[i], 40 + 30 * 3 * i, 400, 3, mirrored);
            for (let j = 0; j < heads.length; j++) {
                GooseDrawing.drawWings(ctx, wings[wingsIndex], bodies.running[i], 40 + j * 100, 1150 + 100 * i, 3, mirrored);
                GooseDrawing.drawGoose(ctx, bodies.running[i], heads[j], 40 + j * 100, 1150 + 100 * i, 3, mirrored);
            }
        }
    }
}
