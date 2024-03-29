import { GOOSE_IMAGE } from '../assets/goose-image';
import { GooseHead } from './goose-heads';
import { GooseBody } from './goose-bodies';
import { GooseWings } from './goose-wings';

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

            const w = calculatePtOnBody(body.wingsX, body.wingsY, x, y, body, scale, mirrored);

            ctx.fillStyle = 'yellow';
            ctx.fillRect(w.x, w.y, 5, 5);
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

    export function drawHonk(
        ctx: CanvasRenderingContext2D,
        stage: number,
        body: GooseBody,
        head: GooseHead,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
    ) {
        if (stage < 0 || stage > 2) {
            return;
        }

        const headA =
            head.type === 'side' ? { x: body.headSideX, y: body.headSideY } : { x: body.headTopX, y: body.headTopY };
        const headP = calculatePtOnBody(headA.x, headA.y, x, y, body, scale, mirrored);
        const p = calculateStartPoint(headP.x, headP.y, head.anchorX, head.anchorY, scale, mirrored, head.imgW);

        ctx.drawImage(
            GOOSE_IMAGE,
            !mirrored ? 2 + (8 + 1) * stage : GOOSE_IMAGE.width - 8 - (2 + (8 + 1) * stage),
            147,
            8,
            16,
            p.x + (!mirrored ? head.honkX * scale : -head.honkX),
            p.y + head.honkY * scale,
            8 * scale,
            16 * scale,
        );
    }

    export function drawWings(
        ctx: CanvasRenderingContext2D,
        wings: GooseWings,
        body: GooseBody,
        x: number,
        y: number,
        scale: number,
        mirrored: boolean,
    ) {
        const wingsP = calculatePtOnBody(body.wingsX, body.wingsY, x, y, body, scale, mirrored);
        const p = calculateStartPoint(wingsP.x, wingsP.y, wings.anchorX, wings.anchorY, scale, mirrored, wings.imgW);

        ctx.drawImage(
            GOOSE_IMAGE,
            !mirrored ? wings.imgX : GOOSE_IMAGE.width - wings.imgW - wings.imgX,
            wings.imgY,
            wings.imgW,
            wings.imgH,
            p.x,
            p.y,
            wings.imgW * scale,
            wings.imgH * scale,
        );
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
