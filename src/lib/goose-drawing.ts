import { GOOSE_IMAGE } from '../assets/goose-image';
import { GooseHead } from './goose-heads';
import { GooseBody } from './goose-bodies';

export namespace GooseDrawing {
    export function drawHead(
        ctx: CanvasRenderingContext2D,
        head: GooseHead,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
        debug = false,
    ) {
        const p = calculateStartPoint(x, y, head.anchorX, head.anchorY, scale, mirrored, head.imgW);

        ctx.drawImage(
            GOOSE_IMAGE,
            !mirrored ? head.imgX : GOOSE_IMAGE.width - head.imgW - head.imgX,
            head.imgY,
            head.imgW,
            head.imgH,
            p.x,
            p.y,
            head.imgW * scale,
            head.imgH * scale,
        );

        if (debug) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, 5, 5);
        }
    }

    export function drawBody(
        ctx: CanvasRenderingContext2D,
        body: GooseBody,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
        debug = false,
    ) {
        const p = calculateStartPoint(x, y, body.anchorX, body.anchorY, scale, mirrored, body.imgW);

        ctx.drawImage(
            GOOSE_IMAGE,
            !mirrored ? body.imgX : GOOSE_IMAGE.width - body.imgW - body.imgX,
            body.imgY,
            body.imgW,
            body.imgH,
            p.x,
            p.y,
            body.imgW * scale,
            body.imgH * scale,
        );

        if (debug) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x, y, 5, 5);

            const h1 = calculatePtOnBody(body.headSideX, body.headSideY, x, y, body, scale, mirrored);

            ctx.fillStyle = 'green';
            ctx.fillRect(h1.x, h1.y, 5, 5);

            const h2 = calculatePtOnBody(body.headTopX, body.headTopY, x, y, body, scale, mirrored);

            ctx.fillStyle = 'blue';
            ctx.fillRect(h2.x, h2.y, 5, 5);
        }
    }

    export function drawGoose(
        ctx: CanvasRenderingContext2D,
        body: GooseBody,
        head: GooseHead,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
        debug = false,
    ) {
        drawBody(ctx, body, x, y, scale, mirrored, debug);

        const headA =
            head.type === 'side' ? { x: body.headSideX, y: body.headSideY } : { x: body.headTopX, y: body.headTopY };
        const headP = calculatePtOnBody(headA.x, headA.y, x, y, body, scale, mirrored);

        drawHead(ctx, head, headP.x, headP.y, scale, mirrored, debug);
    }
}

function calculateStartPoint(
    pX: number,
    pY: number,
    aX: number,
    aY: number,
    scale: number,
    mirrored: boolean,
    width: number,
) {
    const fX = !mirrored ? pX - aX * scale : pX - (width - aX) * scale;
    const fY = pY - aY * scale;
    return {
        x: fX,
        y: fY,
    };
}

function calculatePtOnBody(
    pX: number,
    pY: number,
    x: number,
    y: number,
    body: GooseBody,
    scale: number,
    mirrored: boolean,
) {
    const p = calculateStartPoint(x, y, body.anchorX, body.anchorY, scale, mirrored, body.imgW);

    return {
        x: p.x + (!mirrored ? pX * scale : (body.imgW - pX) * scale),
        y: p.y + pY * scale,
    };
}
