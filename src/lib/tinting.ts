export function tintImage(img: HTMLImageElement, red: number, green: number, blue: number) {
    const rgbks = generateRGBKs(img);
    return generateTintImage(img, rgbks, red, green, blue);
}

function generateTintImage(img: HTMLImageElement, rgbks: HTMLImageElement[], red: number, green: number, blue: number) {
    const buff = document.createElement('canvas');
    buff.width = img.width;
    buff.height = img.height;

    const ctx = buff.getContext('2d')!;

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(rgbks[3], 0, 0);

    ctx.globalCompositeOperation = 'lighter';
    if (red > 0) {
        ctx.globalAlpha = red / 255.0;
        ctx.drawImage(rgbks[0], 0, 0);
    }
    if (green > 0) {
        ctx.globalAlpha = green / 255.0;
        ctx.drawImage(rgbks[1], 0, 0);
    }
    if (blue > 0) {
        ctx.globalAlpha = blue / 255.0;
        ctx.drawImage(rgbks[2], 0, 0);
    }

    return buff;
}

function generateRGBKs(img: HTMLImageElement) {
    const w = img.width;
    const h = img.height;
    const rgbks: HTMLImageElement[] = [];

    let canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    let ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const pixels = ctx.getImageData(0, 0, w, h).data;

    // 4 is used to ask for 3 images: red, green, blue and
    // black in that order.
    for (let rgbI = 0; rgbI < 4; rgbI++) {
        canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const to = ctx.getImageData(0, 0, w, h);
        const toData = to.data;

        for (let i = 0, len = pixels.length; i < len; i += 4) {
            toData[i] = rgbI === 0 ? pixels[i] : 0;
            toData[i + 1] = rgbI === 1 ? pixels[i + 1] : 0;
            toData[i + 2] = rgbI === 2 ? pixels[i + 2] : 0;
            toData[i + 3] = pixels[i + 3];
        }

        ctx.putImageData(to, 0, 0);

        // image is _slightly_ faster then canvas for this, so convert
        let imgComp = new Image();
        imgComp.src = canvas.toDataURL();

        rgbks.push(imgComp);
    }

    return rgbks;
}
