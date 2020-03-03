export interface GooseWings {
    imgX: number;
    imgY: number;
    imgW: number;
    imgH: number;
    anchorX: number;
    anchorY: number;
    description: string;
}

export function getWings() {
    const wings: GooseWings[] = [];
    wings.push(
        {
            imgX: 36,
            imgY: 103,
            imgW: 16,
            imgH: 10,
            anchorX: 8,
            anchorY: 10,
            description: '',
        },
        {
            imgX: 36 + 16 + 1,
            imgY: 103,
            imgW: 19,
            imgH: 10,
            anchorX: 10,
            anchorY: 10,
            description: '',
        },
        {
            imgX: 36 + 16 + 1 + 19 + 1,
            imgY: 103,
            imgW: 26,
            imgH: 10,
            anchorX: 13,
            anchorY: 10,
            description: '',
        },

        {
            imgX: 36,
            imgY: 103 + 11,
            imgW: 27,
            imgH: 11,
            anchorX: 14,
            anchorY: 11,
            description: '',
        },
        {
            imgX: 36 + 27 + 1,
            imgY: 103 + 11,
            imgW: 24,
            imgH: 11,
            anchorX: 12,
            anchorY: 11,
            description: '',
        },
        {
            imgX: 36 + 27 + 1 + 24 + 1,
            imgY: 103 + 11,
            imgW: 32,
            imgH: 11,
            anchorX: 16,
            anchorY: 11,
            description: '',
        },
        {
            imgX: 36 + 27 + 1 + 24 + 1 + 32 + 1,
            imgY: 103 + 11,
            imgW: 23,
            imgH: 11,
            anchorX: 12,
            anchorY: 11,
            description: '',
        },
    );

    return wings;
}
