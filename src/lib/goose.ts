import { GooseDrawing } from './goose-drawing';
import { getHeads } from './goose-heads';
import { getBodies } from './goose-bodies';
import { Helpers } from './helpers';
import { GOOSE_IMAGE_PROMISE } from '../assets/goose-image';
import { MEME_IMAGE_PROMISE, MEME_IMAGE_STR } from '../assets/meme-images';
import { createWinXpWindow, WindowsXpWindow } from '../windows-window/window-maker';
import { MEME_TEXTS } from '../assets/meme-texts';
import { windowsInjectStyles } from '../windows-window/windows-inject-styles';

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
        action: 'stand' as 'stand' | 'moveTo' | 'followMouse' | 'goForPresent' | 'bringPresent',
        position: { x: 0, y: 0 },
        time: 0,
        mirrored: false,
        additionalData: {} as any,
    };

    private head = {
        index: 0,
        time: 0,
    };

    private windows: WindowsXpWindow[] = [];

    private timeSinceHonk = 0;

    private mousePosition = { x: 0, y: 0 };

    start(debug = false) {
        windowsInjectStyles();
        Promise.all([GOOSE_IMAGE_PROMISE, ...MEME_IMAGE_PROMISE]).then(() => {
            this.init(debug);
            createWinXpWindow('text', MEME_TEXTS[1].text, 500, 100, true, true);
            createWinXpWindow('image', MEME_IMAGE_STR[0], 100, 100, true, true);
        });
    }

    private init(debug: boolean) {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.mousePosition.x = e.pageX;
            this.mousePosition.y = e.pageY;
        });

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth * this.scale;
        this.canvas.height = this.canvasHeight * this.scale;
        this.canvas.style.background = debug ? '#00393b' : 'transparent';
        this.canvas.style.position = 'absolute';
        this.canvas.style.zIndex = '999999';
        this.canvas.oncontextmenu = e => {
            e.preventDefault();
        };

        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;

        this.updateCanvasPosition();
        document.body.appendChild(this.canvas);

        this.lastUpdateTimestamp = +new Date();
        requestAnimationFrame(() => this.loop());
    }

    private update(delta: number) {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call start() first.');
        }

        this.timeSinceHonk += delta;
        this.body.time += delta;
        this.target.time += delta;
        this.head.time += delta;

        if (this.body.time > 0.1) {
            this.body.time = 0;
            this.body.frame++;
            if (this.body.frame > 1000_000_000) {
                this.body.frame = 0;
            }
        }

        let forcedSpeed = null;

        if (this.target.action === 'followMouse') {
            this.target.position = this.mousePosition;
        }

        if (this.target.action === 'bringPresent') {
            this.target.mirrored = true;
            forcedSpeed = 'walking';
            this.head.index = 10;

            // Testing
            this.target.position = this.mousePosition;
        }

        const distance = Helpers.distance(
            this.position.x,
            this.position.y,
            this.target.position.x,
            this.target.position.y,
        );

        let speed = 0;

        if ((!forcedSpeed && distance > 250) || forcedSpeed === 'running') {
            this.body.state = 'running';
            speed = this.runSpeed;
        } else if ((!forcedSpeed && distance > 25) || forcedSpeed === 'walking') {
            this.body.state = 'walking';
            speed = this.walkSpeed;
        } else {
            this.body.state = 'standing';
        }

        this.position = Helpers.moveTowards(
            this.position.x,
            this.position.y,
            this.target.position.x,
            this.target.position.y,
            speed * delta,
        );
        this.position.x = Helpers.clamp(
            this.position.x,
            -this.canvas.width - 20,
            document.body.clientWidth + this.canvas.width + 20,
        );
        this.position.y = Helpers.clamp(
            this.position.y,
            -this.canvas.height - 20,
            document.body.clientHeight + this.canvas.height + 20,
        );
        this.mirrored = this.target.mirrored
            ? this.position.x < this.target.position.x
            : this.position.x > this.target.position.x;
    }

    private draw() {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call start() first.');
        }

        this.updateCanvasPosition();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        GooseDrawing.drawGoose(
            this.ctx,
            this.bodies[this.body.state][this.body.frame % this.bodies[this.body.state].length],
            this.heads[this.head.index],
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
            throw new Error('Goose not initialized, call start() first.');
        }

        this.canvas.style.left = `${this.position.x - this.canvas.width / 2}px`;
        this.canvas.style.top = `${this.position.y - this.canvas.height}px`;
    }

    followMouse() {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call start() first.');
        }

        this.target.mirrored = false;
        this.target.action = 'followMouse';
        this.target.additionalData = {};
        this.target.time = 0;
        this.head.index = 0;
    }

    goForPresent(type?: 'image' | 'text', content?: string, fromLeft?: boolean) {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call start() first.');
        }

        this.target.mirrored = false;
        this.target.action = 'goForPresent';
        this.target.additionalData = {};
        this.target.time = 0;
        this.head.index = 0;

        fromLeft = fromLeft ?? Math.random() < 0.5;
        type = type ?? (Math.random() < 0.5 ? 'image' : 'text');
        if (!content) {
            content = type === 'image' ? Helpers.randomItem(MEME_IMAGE_STR) : Helpers.randomItem(MEME_TEXTS).text;
        }

        const x = 0;
        const y = 0;

        this.windows.push(createWinXpWindow(type, content, x, y, !fromLeft, false));
    }

    private bringPresent() {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call start() first.');
        }
    }

    honk() {
        if (!this.ctx || !this.canvas) {
            throw new Error('Goose not initialized, call start() first.');
        }
        this.timeSinceHonk = 0;
    }
}
