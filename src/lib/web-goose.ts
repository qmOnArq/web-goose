import { GooseDrawing } from './goose-drawing';
import { getHeads } from './gooe-heads';
import { getBodies } from './goose-bodies';

export class WebGoose {
    init() {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = 1000;
        canvas.height = 500;
        canvas.style.background = 'black';

        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;

        const heads = getHeads();
        for (let i = 0; i < heads.length; i++) {
            GooseDrawing.drawHead(ctx, heads[i], 20 + (16 + 1) * 3 * i, 100, 3, false);
        }

        const bodies = getBodies();
        for (let i = 0; i < bodies.standing.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.standing[i], 20 + 30 * 3 * i, 150, 3, false);
        }

        for (let i = 0; i < bodies.walking.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.walking[i], 20 + 30 * 3 * i, 250, 3, false);
        }

        for (let i = 0; i < bodies.running.length; i++) {
            GooseDrawing.drawBody(ctx, bodies.running[i], 20 + 30 * 3 * i, 350, 3, false);
        }
    }
}
