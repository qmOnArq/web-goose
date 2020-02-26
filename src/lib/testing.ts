import { GooseDrawing } from './goose-drawing';
import { getHeads } from './goose-heads';
import { getBodies } from './goose-bodies';

export class Testing {
    init() {
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

        const heads = getHeads();
        for (let i = 0; i < heads.length; i++) {
            GooseDrawing.drawHead(ctx, heads[i], 20 + (16 + 1) * 3 * i, 100, 3, false);
        }

        const bodies = getBodies();
        for (let i = 0; i < bodies.standing.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.standing[i], 40 + 30 * 3 * i, 200, 3, false);
            for (let j = 0; j < heads.length; j++) {
                GooseDrawing.drawGoose(ctx, bodies.standing[i], heads[j], 40 + j * 100, 550, 3, false);
            }
        }

        for (let i = 0; i < bodies.walking.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.walking[i], 40 + 30 * 3 * i, 300, 3, false);
            for (let j = 0; j < heads.length; j++) {
                GooseDrawing.drawGoose(ctx, bodies.walking[i], heads[j], 40 + j * 100, 700 + 100 * i, 3, false);
            }
        }

        for (let i = 0; i < bodies.running.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.running[i], 40 + 30 * 3 * i, 400, 3, false);
            for (let j = 0; j < heads.length; j++) {
                GooseDrawing.drawGoose(ctx, bodies.running[i], heads[j], 40 + j * 100, 1150 + 100 * i, 3, false);
            }
        }
    }
}
