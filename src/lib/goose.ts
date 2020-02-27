import { GooseDrawing } from './goose-drawing';
import { getHeads } from './goose-heads';
import { getBodies } from './goose-bodies';
import { Helpers } from './helpers';

export class Goose {
    private readonly canvasWidth = 50;
    private readonly canvasHeight = 50;
    private readonly scale = 2;
    private readonly walkSpeed = 150;
    private readonly runSpeed = this.walkSpeed * 2;

    private canvas?: HTMLCanvasElement;
    private ctx?: CanvasRenderingContext2D;

    private lastUpdateTimestamp = 0;
    private readonly heads = getHeads();
    private readonly bodies = getBodies();

    private position = { x: 0, y: 0 };
    private mirrored = false;

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

    private mousePosition = { x: 0, y: 0 };

    init(debug = false) {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });

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

        this.timeSinceHonk += delta;
        this.body.time += delta;
        this.target.time += delta;

        if (this.body.time > 0.1) {
            this.body.time = 0;
            this.body.frame++;
            if (this.body.frame > 1000_000_000) {
                this.body.frame = 0;
            }
        }

        if (this.target.action === 'followMouse') {
            const distance = Helpers.distance(
                this.position.x,
                this.position.y,
                this.mousePosition.x,
                this.mousePosition.y,
            );

            let speed = 0;

            if (distance > 250) {
                this.body.state = 'running';
                speed = this.runSpeed;
            } else if (distance > 25) {
                this.body.state = 'walking';
                speed = this.walkSpeed;
            } else {
                this.body.state = 'standing';
            }

            this.position = Helpers.moveTowards(
                this.position.x,
                this.position.y,
                this.mousePosition.x,
                this.mousePosition.y,
                speed * delta,
            );
            this.mirrored = this.mousePosition.x < this.position.x;
        }
    }

    private draw() {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call init() first.');
        }

        this.updateCanvasPosition();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        GooseDrawing.drawGoose(
            this.ctx,
            this.bodies[this.body.state][this.body.frame % this.bodies[this.body.state].length],
            this.heads[0],
            this.canvas.width / 2,
            this.canvas.height - 3 * this.scale,
            this.scale,
            this.mirrored,
        );
    }

    private loop() {
        const now = +new Date();
        this.update((now - this.lastUpdateTimestamp) / 1000);
        this.draw();
        this.lastUpdateTimestamp = now;
        requestAnimationFrame(() => this.loop());
    }

    private updateCanvasPosition() {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call init() first.');
        }

        this.canvas.style.left = `${this.position.x - this.canvas.width / 2}px`;
        this.canvas.style.top = `${this.position.y - this.canvas.height}px`;
    }
}
