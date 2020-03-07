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
    private readonly runSpeed = this.walkSpeed * 1.5;
    private readonly fastRunningSpeed = this.runSpeed * 1.5;

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

    private fastRunning = {
        is: false,
        closingWings: false,
        time: 0,
    };

    private flappingWings = {
        is: false,
        time: 0,
        frameTime: 0,
        frame: 0,
        increasing: false,
    };

    private windows: WindowsXpWindow[] = [];

    private timeSinceHonkRoll = 0;
    private timeSinceHonk = 0;
    private timeSinceWingFlapRoll = 0;
    private timeSinceWingFlap = 0;
    private timeSinceFootstep = 0;

    private mousePosition = { x: 100 + 50 * Math.random(), y: 100 + 50 * Math.random() };

    private visible = false;

    start(debug = false) {
        windowsInjectStyles();
        footstepInjectStyles();
        Promise.all([GOOSE_IMAGE_PROMISE, ...MEME_IMAGE_PROMISE]).then(() => {
            this.init(debug);
            (window as any).GOOSE = this;
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

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.lastUpdateTimestamp = +new Date();
                this.visible = true;
            } else {
                this.visible = false;
            }
        });

        this.visible = document.visibilityState === 'visible';

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth * this.scale;
        this.canvas.height = this.canvasHeight * this.scale;
        this.canvas.style.background = debug ? '#00393b' : 'transparent';
        this.canvas.style.position = 'fixed';
        this.canvas.style.zIndex = '999999';
        this.canvas.oncontextmenu = e => {
            e.preventDefault();
            this.flapWings();
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

        const startingPosition = this.getRandomPointOutOfScreen(
            Math.max(this.canvasWidth * this.scale, this.canvasHeight * this.scale) * 2,
        );
        this.position.x = startingPosition.x;
        this.position.y = startingPosition.y;
        this.target.position.x = startingPosition.x;
        this.target.position.y = startingPosition.y;

        this.updateCanvasPosition();
        document.body.appendChild(this.shadow);
        document.body.appendChild(this.canvas);

        this.lastUpdateTimestamp = +new Date();
        requestAnimationFrame(() => this.loop());
        this.moveTo();
    }

    private update(delta: number) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        if (this.target.action == null) {
            if (this.target.queued.length === 0) {
                this.doRandomAction();
            } else {
                const action = this.target.queued[0];
                this.target.queued = this.target.queued.slice(1);
                this.target.additionalData = action.data ?? {};
                this[action.action]();
            }
        }

        this.tryToHonk();
        this.tryToWingFlap();

        this.timeSinceHonk += delta;
        this.timeSinceHonkRoll += delta;
        this.timeSinceWingFlap += delta;
        this.timeSinceWingFlapRoll += delta;
        this.body.time += delta;
        this.target.time += delta;
        this.head.time += delta;
        this.honking.time += delta;
        this.wing.time += delta;
        this.fastRunning.time += delta;
        this.flappingWings.time += delta;
        this.flappingWings.frameTime += delta;

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

        let forcedSpeed = null as 'fastRunning' | 'running' | 'walking' | 'standing' | null;

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
                this.target.position.x = this.mousePosition.x;
                this.target.position.y = this.mousePosition.y;
                if (this.target.time >= this.target.additionalData.waitFor) {
                    this.clearCurrentAction();
                }
                break;
            case 'moveTo':
                if (distance < 10) {
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

        let speed: number;

        if ((!forcedSpeed && distance > 500) || forcedSpeed === 'fastRunning') {
            this.body.state = 'running';
            speed = this.fastRunningSpeed;
            if (!this.fastRunning.is) {
                this.startFastRunning();
            }
        } else if ((!forcedSpeed && distance > 250) || forcedSpeed === 'running') {
            this.body.state = 'running';
            speed = this.runSpeed;
            if (this.fastRunning.is) {
                this.stopFastRunning();
            }
        } else if ((!forcedSpeed && distance > 5) || forcedSpeed === 'walking') {
            this.body.state = 'walking';
            speed = this.walkSpeed;
            if (this.fastRunning.is) {
                this.stopFastRunning();
            }
        } else {
            this.body.state = 'standing';
            speed = 0;
            if (this.fastRunning.is) {
                this.stopFastRunning();
            }
        }

        const oldPosition = this.position;

        this.position = Helpers.moveTowards(
            this.position.x,
            this.position.y,
            this.target.position.x,
            this.target.position.y,
            speed * delta,
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

        if (this.fastRunning.is) {
            const runningWingAnimDuration = 0.3;
            const runningWingStage = Helpers.clamp(
                0,
                Math.round((this.fastRunning.time / runningWingAnimDuration / 3) * 10),
                2,
            );
            this.wing.shown = true;
            this.wing.index = runningWingStage;
        } else if (this.fastRunning.closingWings) {
            const runningWingAnimDuration = 0.3;
            const runningWingStage = Helpers.clamp(
                0,
                Math.round((this.fastRunning.time / runningWingAnimDuration / 3) * 10),
                2,
            );
            this.wing.shown = true;
            this.wing.index = 2 - runningWingStage;
            if (this.fastRunning.time > runningWingAnimDuration) {
                this.wing.shown = false;
                this.fastRunning.closingWings = false;
            }
        }

        if (this.flappingWings.is) {
            const frameDuration = 0.07;
            const length = 6;

            const fullDuration = frameDuration * length * 2 * 2 + frameDuration;
            if (this.flappingWings.frameTime > frameDuration) {
                this.flappingWings.frame += this.flappingWings.increasing ? 1 : -1;
                this.flappingWings.frameTime = 0;
                if (this.flappingWings.frame >= length) {
                    this.flappingWings.increasing = false;
                    this.flappingWings.frame = length - 1;
                } else if (this.flappingWings.frame === -1) {
                    this.flappingWings.increasing = true;
                    this.flappingWings.frame = 0;
                }
            }

            this.wing.shown = true;
            this.wing.index = this.flappingWings.frame;

            if (this.flappingWings.time > fullDuration) {
                this.wing.shown = false;
                this.flappingWings.is = false;
            }
        }

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

        let headIndex = this.flappingWings.is && this.target.action !== 'bringPresent' ? 14 : this.head.index;
        headIndex = this.fastRunning.is ? 6 : headIndex;
        headIndex = this.honking.is ? getHonkHeadForIndex(headIndex) : headIndex;

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
        if (this.visible) {
            const now = +new Date();
            this.update((now - this.lastUpdateTimestamp) / 1000);
            this.draw();
            this.lastUpdateTimestamp = now;
        }
        requestAnimationFrame(() => this.loop());
    }

    private updateWindowsPositions() {
        this.windows.forEach(window => {
            window.node.style.left = `${window.left - document.documentElement.scrollLeft}px`;
            window.node.style.top = `${window.top - document.documentElement.scrollTop}px`;
        });
    }

    private updateCanvasPosition() {
        if (!this.ctx || !this.canvas || !this.shadow) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.canvas.style.left = `${this.position.x - this.canvas.width / 2 - document.documentElement.scrollLeft}px`;
        this.canvas.style.top = `${this.position.y - this.canvas.height - document.documentElement.scrollTop}px`;

        this.shadow.style.left = `${this.position.x -
            (this.shadowWidth * this.scale) / 2 -
            document.documentElement.scrollLeft}px`;
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
            this.canvas.width,
            this.canvas.height,
        );
    }

    private getRandomPointOnScreen(xPadding = 0, yPadding = 0) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        const rect = Helpers.getViewportWithPadding(this.canvas.width + xPadding, this.canvas.height + yPadding);
        return {
            x: Math.round(rect.width * Math.random()) + rect.left,
            y: Math.round(rect.height * Math.random()) + rect.top,
        };
    }

    private getRandomPointOutOfScreen(padding = 0) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        const viewport = Helpers.getViewportWithPadding();

        return Helpers.randomPointOnRect(
            viewport.left - padding,
            viewport.top - padding,
            viewport.width + 2 * padding,
            viewport.height + 2 * padding,
        );
    }

    tryToHonk() {
        const increasePer = 3; // seconds
        const increaseBy = 0.01; // %

        if (this.timeSinceHonkRoll >= increasePer) {
            this.timeSinceHonkRoll = 0;

            const increases = Math.floor(this.timeSinceHonk / increasePer);
            const chance = increaseBy * increases;
            const random = Math.random();

            if (random >= 1 - chance) {
                this.honk();
            }
        }
    }

    tryToWingFlap() {
        const increasePer = 6; // seconds
        const increaseBy = 0.01; // %

        if (this.timeSinceWingFlapRoll >= increasePer) {
            this.timeSinceWingFlapRoll = 0;

            const increases = Math.floor(this.timeSinceWingFlap / increasePer);
            const chance = increaseBy * increases;
            const random = Math.random();

            if (random >= 1 - chance) {
                this.flapWings();
            }
        }
    }

    doRandomAction() {
        const windowChance = 0.5 / Math.pow(3, this.windows.length);
        const windowsRoll = Math.random();
        if (windowsRoll < windowChance) {
            this.goForPresent();
            return;
        }

        const actions: { action: GooseAction; data?: any }[][] = [
            ...(this.isGooseOnScreen() ? [[{ action: 'stand' as GooseAction }]] : []),
            [{ action: 'moveTo' }, { action: 'stand' }],
            [{ action: 'followMouse' }, { action: 'stand' }],
        ];

        const singleItemChance = 1 / actions.length;
        const roll = Math.random();
        const index = Math.floor(roll / singleItemChance);
        this.target.queued = [...this.target.queued, ...actions[index]];
    }

    followMouse() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.target.mirrored = false;
        this.target.action = 'followMouse';
        this.target.additionalData.waitFor = this.target.additionalData.waitFor ?? Math.random() * 3 + 1;
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

        if (!type) {
            const imgCount = this.windows.filter(w => w.type === 'image').length;
            const txtCount = this.windows.filter(w => w.type === 'text').length;

            if (imgCount > txtCount) {
                type = Math.random() < 0.85 ? 'text' : 'image';
            } else if (txtCount > imgCount) {
                type = Math.random() < 0.85 ? 'image' : 'text';
            } else {
                type = Math.random() < 0.5 ? 'image' : 'text';
            }
        }

        if (!content) {
            content = type === 'image' ? Helpers.randomItem(MEME_IMAGE_STR) : Helpers.randomItem(MEME_TEXTS).text;
        }

        const x = fromLeft ? -400 : document.body.clientWidth + 400 + document.documentElement.scrollLeft;
        const y = document.documentElement.scrollTop + 400 + Math.random() * 100;

        const window = createWinXpWindow(type, content, x, y, !fromLeft, false);
        this.windows = [...this.windows, window];

        window.closed.then(() => {
            if (this.target.action === 'bringPresent' && this.target.additionalData.window === window) {
                this.clearCurrentAction();
                this.stand();
                setTimeout(() => {
                    this.honk();
                    this.flapWings();
                    this.target.position.x = this.position.x + 1;
                    this.target.position.y = this.position.y + 1;
                }, 200);
            }

            this.windows = this.windows.filter(w => w.id !== window.id);
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
        this.target.position = this.getRandomPointOnScreen(window.width, window.height / 2);
        this.target.position.x += -5 + Math.random() * 10;
        this.target.position.y += -5 + Math.random() * 10;
    }

    honk() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }
        this.timeSinceHonk = 0;
        this.honking.is = true;
        this.honking.time = 0;
        playHonk();
    }

    flapWings() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }
        this.flappingWings.is = true;
        this.flappingWings.time = 0;
        this.flappingWings.frame = 0;
        this.flappingWings.frameTime = 0;
        this.flappingWings.increasing = true;
        this.timeSinceWingFlap = 0;
    }

    stand() {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.target.mirrored = false;
        this.target.action = 'stand';
        this.target.additionalData.waitFor = this.target.additionalData.waitFor ?? Math.random() * 3 + 1;
        this.target.time = 0;
        this.head.index = 0;
        this.target.position.x = this.position.x;
        this.target.position.y = this.position.y;
    }

    moveTo(target?: { x: number; y: number }) {
        if (!this.ctx || !this.canvas) {
            throw new Error(NOT_INITIALIZED_MSG);
        }

        this.target.mirrored = false;
        this.target.action = 'moveTo';
        this.target.time = 0;
        this.head.index = 0;

        if (target) {
            this.target.position.x = target.x;
            this.target.position.y = target.y;
        } else if (this.target.additionalData.target) {
            this.target.position.x = this.target.additionalData.target.x;
            this.target.position.y = this.target.additionalData.target.y;
        } else {
            this.target.position = this.getRandomPointOnScreen();
        }
    }

    clearCurrentAction() {
        this.target.action = null;
        this.target.additionalData = {};
    }

    startFastRunning() {
        this.fastRunning.is = true;
        this.fastRunning.closingWings = false;
        this.fastRunning.time = 0;
    }

    stopFastRunning() {
        this.fastRunning.is = false;
        this.fastRunning.closingWings = true;
        this.fastRunning.time = 0;
    }
}

type GooseAction = 'stand' | 'moveTo' | 'followMouse' | 'goForPresent' | 'bringPresent';
const NOT_INITIALIZED_MSG = 'Goose not initialized, call start() first.';
