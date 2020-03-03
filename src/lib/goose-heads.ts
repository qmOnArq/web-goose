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

export function getHonkHeadForIndex(index: number) {
    switch (index) {
        case 0:
            return 1;
        case 1:
            return 1;
        case 2:
            return 1;
        case 3:
            return 1;
        case 4:
            return 5;
        case 5:
            return 5;
        case 6:
            return 7;
        case 7:
            return 7;
        case 8:
            return 9;
        case 9:
            return 9;
        case 10:
            return 11;
        case 11:
            return 11;
        case 12:
            return 12;
        case 13:
            return 1;
        case 14:
            return 15;
        case 15:
            return 15;
        default:
            throw new Error('Invalid head index');
    }
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

    heads[6].type = 'side';
    heads[7].type = 'side';
    heads[8].type = 'side';
    heads[9].type = 'side';
    heads[10].type = 'side';
    heads[11].type = 'side';

    return heads;
}
