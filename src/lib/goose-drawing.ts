import { GOOSE_IMAGE } from '../assets/goose-image';
import { GooseHead } from './gooe-heads';
import { GooseBody } from './goose-bodies';

export class GooseDrawing {
    static drawHead(
        ctx: CanvasRenderingContext2D,
        head: GooseHead,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
        debug = false,
    ) {
        const fX = !mirrored ? x - head.anchorX * scale : x - (head.imgW - head.anchorX) * scale;
        const fY = y - head.anchorY * scale;

        ctx.drawImage(
            GOOSE_IMAGE,
            !mirrored ? head.imgX : GOOSE_IMAGE.width - head.imgW - head.imgX,
            head.imgY,
            head.imgW,
            head.imgH,
            fX,
            fY,
            head.imgW * scale,
            head.imgH * scale,
        );

        if (debug) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, 5, 5);
        }
    }

    static drawBody(
        ctx: CanvasRenderingContext2D,
        body: GooseBody,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
        debug = false,
    ) {
        const fX = !mirrored ? x - body.anchorX * scale : x - (body.imgW - body.anchorX) * scale;
        const fY = y - body.anchorY * scale;

        ctx.drawImage(
            GOOSE_IMAGE,
            !mirrored ? body.imgX : GOOSE_IMAGE.width - body.imgW - body.imgX,
            body.imgY,
            body.imgW,
            body.imgH,
            fX,
            fY,
            body.imgW * scale,
            body.imgH * scale,
        );

        if (debug) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, 5, 5);
        }
    }

    static drawGoose(
        ctx: CanvasRenderingContext2D,
        body: GooseBody,
        head: GooseHead,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
        debug = false,
    ) {}
}
