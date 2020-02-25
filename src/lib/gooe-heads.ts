export interface GooseHead {
    imgX: number;
    imgY: number;
    imgW: number;
    imgH: number;
    type: 'side' | 'top';
    anchorX: number;
    anchorY: number;
    description: string;
}

export function getHeads() {
    const heads: GooseHead[] = [];
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 2; x++) {
            heads.push({
                imgX: 2 + (16 + 1) * x,
                imgY: 2 + (16 + 1) * y,
                imgW: 16,
                imgH: 16,
                type: 'top',
                anchorX: 4,
                anchorY: 15,
                description: '',
            });
        }
    }
    heads[6].anchorX = 0;
    heads[6].anchorY = 10;

    heads[7].anchorX = 0;
    heads[7].anchorY = 10;

    heads[8].anchorX = 0;
    heads[8].anchorY = 4;

    heads[9].anchorX = 0;
    heads[9].anchorY = 4;

    heads[10].anchorX = 0;
    heads[10].anchorY = 4;

    heads[11].anchorX = 0;
    heads[11].anchorY = 4;

    return heads;
}
