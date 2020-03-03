import { GooseDrawing } from './goose-drawing';
import { getHeads, getHonkHeadForIndex } from './goose-heads';
import { getBodies } from './goose-bodies';
import { Helpers } from './helpers';
import { GOOSE_IMAGE_PROMISE } from '../assets/goose-image';
import { MEME_IMAGE_PROMISE, MEME_IMAGE_STR } from '../assets/meme-images';
import { createWinXpWindow, WindowsXpWindow } from '../windows-window/window-maker';
import { MEME_TEXTS } from '../assets/meme-texts';
import { windowsInjectStyles } from '../windows-window/windows-inject-styles';
import { createFootstep } from '../footsteps/footstep-maker';
import { footstepInjectStyles } from '../footsteps/footstep-inject-styles';
import { playHonk } from '../assets/honk-sound';
import { getWings } from './goose-wings';

export class Goose {
    private readonly canvasWidth = 80;
    private readonly canvasHeight = 50;
    private readonly shadowWidth = 28;
    private readonly shadowHeight = this.shadowWidth / 3;
    private readonly scale = 2;
    private readonly walkSpeed = 150;
    private readonly runSpeed = this.walkSpeed * 2;

    private canvas?: HTMLCanvasElement;
    private ctx?: CanvasRenderingContext2D;
    private shadow?: HTMLElement;

    private lastUpdateTimestamp = 0;
    private readonly heads = getHeads();
    private readonly bodies = getBodies();
    private readonly wings = getWings();

    private position = { x: 0, y: 0 };
    private mirrored = false;

    private body = {
        state: 'standing' as 'standing' | 'walking' | 'running',
        frame: 0,
        time: 0,
    };

    private target = {
        action: 'stand' as GooseAction | null,
        position: { x: 0, y: 0 },
        time: 0,
        mirrored: false,
        additionalData: {} as any,
        queued: [] as { action: GooseAction; data?: any }[],
    };

    private head = {
        index: 0,
        time: 0,
    };

    private wing = {
        index: 0,
        shown: false,
        time: 0,
    };

    private honking = {
        is: false,
        time: 500,
    };

    private windows: WindowsXpWindow[] = [];

    private timeSinceHonk = 0;
    private timeSinceFootstep = 0;

    private mousePosition = { x: 0, y: 0 };

    start(debug = false) {
        windowsInjectStyles();
        footstepInjectStyles();
        Promise.all([GOOSE_IMAGE_PROMISE, ...MEME_IMAGE_PROMISE]).then(() => {
            this.init(debug);
        });
    }

    private init(debug: boolean) {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.mousePosition.x = e.pageX;
            this.mousePosition.y = e.pageY;
        });

        document.addEventListener('scroll', () => {
            this.updateWindowsPositions();
        });

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth * this.scale;
        this.canvas.height = this.canvasHeight * this.scale;
        this.canvas.style.background = debug ? '#00393b' : 'transparent';
        this.canvas.style.position = 'fixed';
        this.canvas.style.zIndex = '999999';
        this.canvas.oncontextmenu = e => {
            e.preventDefault();
        };
        this.canvas.onclick = e => {
            e.preventDefault();
            this.honk();
        };

        this.shadow = document.createElement('div');
        this.shadow.style.pointerEvents = 'none';
        this.shadow.style.position = 'fixed';
        this.shadow.style.zIndex = '999996';
        this.shadow.style.width = `${this.shadowWidth * this.scale}px`;
        this.shadow.style.height = `${this.shadowHeight * this.scale}px`;
        this.shadow.style.borderRadius = '50%';
        this.shadow.style.background = 'black';
        this.shadow.style.opacity = '0.1';

        this.ctx = this.canvas.getContext('2d')!;
        this.ctx.imageSmoothingEnabled = false;

        this.updateCanvasPosition();
        document.body.appendChild(this.shadow);
        document.body.appendChild(this.canvas);

        this.lastUpdateTimestamp = +new Date();
        requestAnimationFrame(() => this.loop());

        // TODO - start and starting position
        // this.goForPresent();
        this.position.x = 200;
        this.position.y = 200;
        this.target.position = this.position;
    }

    private update(delta: number) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        if (this.target.action == null) {
            if (this.target.queued.length === 0) {
                this.stand();
                // TODO - figure out random action
            } else {
                const action = this.target.queued[0];
                this.target.queued = this.target.queued.slice(1);
                this.target.additionalData = action.data ?? {};
                this[action.action]();
            }
        }

        this.timeSinceHonk += delta;
        this.body.time += delta;
        this.target.time += delta;
        this.head.time += delta;
        this.honking.time += delta;
        this.wing.time += delta;

        if (this.body.time > 0.1) {
            this.body.time = 0;
            this.body.frame++;
            if (this.body.frame > this.bodies[this.body.state].length) {
                this.body.frame = 0;
            }
        }

        if (this.honking.time > 0.1) {
            this.honking.is = false;
        }

        let forcedSpeed = null as 'running' | 'walking' | 'standing' | null;

        const distance = Helpers.distance(
            this.position.x,
            this.position.y,
            this.target.position.x,
            this.target.position.y,
        );

        switch (this.target.action) {
            case 'bringPresent':
                forcedSpeed = 'walking';
                const window = this.target.additionalData.window as WindowsXpWindow;
                window.left = this.target.additionalData.fromLeft
                    ? this.position.x - window.width - 15 * this.scale
                    : this.position.x + 15 * this.scale;
                window.top = this.position.y + 30 - window.height;
                if (distance < 15) {
                    this.clearCurrentAction();
                }
                break;
            case 'goForPresent':
                if (distance < 5) {
                    this.clearCurrentAction();
                }
                forcedSpeed = 'running';
                break;
            case 'followMouse':
                this.target.position = this.mousePosition;
                break;
            case 'moveTo':
                if (distance < 30) {
                    this.clearCurrentAction();
                }
                break;
            case 'stand':
                if (this.target.time >= this.target.additionalData.waitFor) {
                    this.clearCurrentAction();
                }
                break;
            default:
                break;
        }

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

        const oldPosition = this.position;

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

        this.timeSinceFootstep += delta;
        if (oldPosition.x !== this.position.x || oldPosition.y !== this.position.y) {
            if (this.timeSinceFootstep > 0.2) {
                this.timeSinceFootstep = 0;
                createFootstep(oldPosition.x, oldPosition.y, this.position.x, this.position.y);
            }
        }
    }

    private draw() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.updateWindowsPositions();
        this.updateCanvasPosition();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.wing.shown) {
            GooseDrawing.drawWings(
                this.ctx,
                this.wings[this.wing.index],
                this.bodies[this.body.state][this.body.frame % this.bodies[this.body.state].length],
                this.canvas.width / 2,
                this.canvas.height - 3 * this.scale,
                this.scale,
                this.mirrored,
            );
        }

        let headIndex = this.honking.is ? getHonkHeadForIndex(this.head.index) : this.head.index;

        GooseDrawing.drawGoose(
            this.ctx,
            this.bodies[this.body.state][this.body.frame % this.bodies[this.body.state].length],
            this.heads[headIndex],
            this.canvas.width / 2,
            this.canvas.height - 3 * this.scale,
            this.scale,
            this.mirrored,
        );

        const honkAnimDuration = 0.3;
        const honkStage = Math.round((this.honking.time / honkAnimDuration / 3) * 10);

        GooseDrawing.drawHonk(
            this.ctx,
            honkStage,
            this.bodies[this.body.state][this.body.frame % this.bodies[this.body.state].length],
            this.heads[headIndex],
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

    private updateWindowsPositions() {
        this.windows.forEach(window => {
            window.node.style.left = `${window.left}px`;
            window.node.style.top = `${window.top - document.documentElement.scrollTop}px`;
        });
    }

    private updateCanvasPosition() {
        if (!this.ctx || !this.canvas || !this.shadow) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.canvas.style.left = `${this.position.x - this.canvas.width / 2}px`;
        this.canvas.style.top = `${this.position.y - this.canvas.height - document.documentElement.scrollTop}px`;

        this.shadow.style.left = `${this.position.x - (this.shadowWidth * this.scale) / 2}px`;
        this.shadow.style.top = `${this.position.y -
            (this.shadowHeight * this.scale) / 1.5 -
            document.documentElement.scrollTop}px`;
    }

    isGooseOnScreen() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        return Helpers.isPointInViewportWithPadding(
            this.position.x,
            this.position.y,
            Math.max(this.canvas.width, this.canvas.height),
        );
    }

    private getRandomPointOnScreen(additionalPadding = 0) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        const rect = Helpers.getViewportWithPadding(
            Math.max(this.canvas.width, this.canvas.height) * 2 + additionalPadding,
        );
        return {
            x: Math.round(rect.width * Math.random()) + rect.left,
            y: Math.round(rect.height * Math.random()) + rect.top,
        };
    }

    followMouse() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.target.mirrored = false;
        this.target.action = 'followMouse';
        this.target.time = 0;
        this.head.index = 0;
    }

    goForPresent(type?: 'image' | 'text', content?: string, fromLeft?: boolean) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        if (!this.isGooseOnScreen()) {
            this.target.queued = [
                { action: 'moveTo' },
                { action: 'stand' },
                { action: 'goForPresent' },
                ...this.target.queued,
            ];
            this.clearCurrentAction();
            return;
        }

        this.target.mirrored = false;
        this.target.action = 'goForPresent';
        this.target.time = 0;
        this.head.index = 0;

        fromLeft = fromLeft ?? Math.random() < 0.5;
        type = type ?? (Math.random() < 0.5 ? 'image' : 'text');
        if (!content) {
            content = type === 'image' ? Helpers.randomItem(MEME_IMAGE_STR) : Helpers.randomItem(MEME_TEXTS).text;
        }

        const x = fromLeft ? -100 : document.body.clientWidth + 100;
        const y = document.documentElement.scrollTop + 400;

        const window = createWinXpWindow(type, content, x, y, !fromLeft, false);
        this.windows.push(window);

        window.closed.then(() => {
            if (this.target.action === 'bringPresent' && this.target.additionalData.window === window) {
                this.clearCurrentAction();
                setTimeout(() => {
                    this.honk();
                    this.openWings();
                }, 100);
            }
        });

        this.target.position = {
            x: fromLeft ? window.left + window.width : window.left,
            y: window.top + window.height - 30,
        };

        this.target.queued = [
            { action: 'stand' },
            { action: 'bringPresent', data: { window, fromLeft } },
            ...this.target.queued,
        ];
    }

    private bringPresent() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        const window = this.target.additionalData.window as WindowsXpWindow;
        if (!window) {
            this.clearCurrentAction();
            return;
        }

        this.target.mirrored = true;
        this.target.action = 'bringPresent';
        this.target.time = 0;
        this.head.index = 10;
        // TODO - window too up
        this.target.position = this.getRandomPointOnScreen(Math.max(window.height, window.width) + 100);
    }

    honk() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }
        this.timeSinceHonk = 0;
        this.honking.is = true;
        this.honking.time = 0;
        playHonk();
        // TODO - honk
    }

    openWings() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }
        // TODO - open wings
    }

    stand() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.target.mirrored = false;
        this.target.action = 'stand';
        this.target.additionalData.waitFor = this.target.additionalData.waitFor ?? Math.random() * 4 + 1;
        this.target.time = 0;
        this.head.index = 0;
    }

    moveTo(target?: { x: number; y: number }) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.target.mirrored = false;
        this.target.action = 'moveTo';
        this.target.time = 0;
        this.head.index = 0;

        this.target.position = target ?? this.target.additionalData.target ?? this.getRandomPointOnScreen();
    }

    clearCurrentAction() {
        this.target.action = null;
        this.target.additionalData = {};
    }
}

type GooseAction = 'stand' | 'moveTo' | 'followMouse' | 'goForPresent' | 'bringPresent';
const NOT_INITIALIZED_MSG = 'Goose not initialized, call start() first.';
