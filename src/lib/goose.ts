import { GooseDrawing } from './goose-drawing';
import { getHeads } from './goose-heads';
import { getBodies } from './goose-bodies';

export class Goose {
    private readonly canvasWidth = 50;
    private readonly canvasHeight = 50;
    private readonly scale = 2;

    private canvas?: HTMLCanvasElement;
    private ctx?: CanvasRenderingContext2D;

    private lastUpdateTimestamp = 0;
    private readonly heads = getHeads();
    private readonly bodies = getBodies();

    private position = { x: 0, y: 0 };

    private body = {
        state: 'standing' as 'standing' | 'walking' | 'running',
        frame: 0,
        time: 0,
    };

    private target = {
        action: 'stand' as 'stand' | 'walk' | 'run' | 'followMouse' | 'goForPresent' | 'bringPresent',
        position: { x: 0, y: 0 },
        time: 0,
    };

    private timeSinceHonk = 0;

    init(debug = false) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth * this.scale;
        this.canvas.height = this.canvasHeight * this.scale;
        this.canvas.style.background = debug ? '#00393b' : 'transparent';
        this.canvas.style.position = 'absolute';
        this.canvas.oncontextmenu = e => {
            e.preventDefault();
        };

        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;

        this.updateCanvasPosition();
        document.body.appendChild(this.canvas);

        this.lastUpdateTimestamp = +new Date();
        requestAnimationFrame(() => this.loop());

        // Testing
        this.target.action = 'followMouse';
    }

    private update(delta: number) {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call init() first.');
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        GooseDrawing.drawGoose(
            this.ctx,
            this.bodies.standing[0],
            this.heads[0],
            this.canvas.width / 2,
            this.canvas.height - 3 * this.scale,
            this.scale,
            false,
        );
    }

    private loop() {
        const now = +new Date();
        this.update(now - this.lastUpdateTimestamp);
        this.lastUpdateTimestamp = now;
        requestAnimationFrame(() => this.loop());
    }

    private updateCanvasPosition() {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call init() first.');
        }

        this.canvas.style.left = `${this.position.x}px`;
        this.canvas.style.top = `${this.position.y}px`;
    }
}
