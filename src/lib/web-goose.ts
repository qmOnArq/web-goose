import { GOOSE_IMAGE } from '../assets/goose-image';

export class WebGoose {
    init() {
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = 500;
        canvas.height = 500;
        canvas.style.background = 'black';

        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;
        GOOSE_IMAGE.then(image => {
            ctx.drawImage(image, 1, 230, 16, 16, 0, 0, 64, 64);
        });
    }
}
