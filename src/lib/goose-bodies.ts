export interface GooseBody {
    imgX: number;
    imgY: number;
    imgW: number;
    imgH: number;
    anchorX: number;
    anchorY: number;
    headTopX: number;
    headTopY: number;
    headSideX: number;
    headSideY: number;
    wingsX: number;
    wingsY: number;
    description: string;
}

export function getBodies() {
    return {
        standing: [
            {
                imgX: 36,
                imgY: 2,
                imgW: 16,
                imgH: 16,
                anchorX: 7,
                anchorY: 15,
                headTopX: 12,
                headTopY: -1,
                headSideX: 15,
                headSideY: 3,
                wingsX: 8,
                wingsY: 4,
                description: '',
            },
        ] as GooseBody[],
        walking: [
            {
                imgX: 36,
                imgY: 2 + 1 + 16,
                imgW: 16,
                imgH: 16,
                anchorX: 8,
                anchorY: 15,
                headTopX: 12,
                headTopY: -1,
                headSideX: 15,
                headSideY: 3,
                wingsX: 8,
                wingsY: 4,
                description: '',
            },
            {
                imgX: 36 + (1 + 16),
                imgY: 2 + 1 + 16,
                imgW: 16,
                imgH: 16,
                anchorX: 8,
                anchorY: 15,
                headTopX: 12,
                headTopY: -1,
                headSideX: 15,
                headSideY: 3,
                wingsX: 8,
                wingsY: 4,
                description: '',
            },
            {
                imgX: 36 + (1 + 16) * 2,
                imgY: 2 + 1 + 16,
                imgW: 16,
                imgH: 16,
                anchorX: 8,
                anchorY: 15,
                headTopX: 12,
                headTopY: -1,
                headSideX: 15,
                headSideY: 3,
                wingsX: 8,
                wingsY: 4,
                description: '',
            },
            {
                imgX: 36 + (1 + 16) * 3,
                imgY: 2 + 1 + 16,
                imgW: 16,
                imgH: 16,
                anchorX: 8,
                anchorY: 15,
                headTopX: 12,
                headTopY: -1,
                headSideX: 15,
                headSideY: 3,
                wingsX: 8,
                wingsY: 4,
                description: '',
            },
        ] as GooseBody[],
        running: [
            {
                imgX: 36,
                imgY: 2 + (1 + 16) * 2,
                imgW: 19,
                imgH: 16,
                anchorX: 9,
                anchorY: 15,
                headTopX: 15,
                headTopY: -1,
                headSideX: 19,
                headSideY: 3,
                wingsX: 12,
                wingsY: 4,
                description: '',
            },
            {
                imgX: 36 + 19 + 1,
                imgY: 2 + (1 + 16) * 2 ,
                imgW: 16,
                imgH: 16,
                anchorX: 8,
                anchorY: 15,
                headTopX: 12,
                headTopY: 0,
                headSideX: 15,
                headSideY: 3,
                wingsX: 8,
                wingsY: 4,
                description: '',
            },
            {
                imgX: 36 + 19 + 1 + 16 + 1,
                imgY: 2 + (1 + 16) * 2 ,
                imgW: 19,
                imgH: 16,
                anchorX: 9,
                anchorY: 15,
                headTopX: 15,
                headTopY: -1,
                headSideX: 19,
                headSideY: 3,
                wingsX: 12,
                wingsY: 4,
                description: '',
            },
            {
                imgX: 36 + 19 + 1 + 16 + 1 + 19 + 1,
                imgY: 2 + (1 + 16) * 2 ,
                imgW: 16,
                imgH: 16,
                anchorX: 8,
                anchorY: 15,
                headTopX: 12,
                headTopY: 0,
                headSideX: 15,
                headSideY: 3,
                wingsX: 8,
                wingsY: 4,
                description: '',
            },
        ] as GooseBody[],
    };
}
