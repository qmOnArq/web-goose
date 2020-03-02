import { Helpers } from '../lib/helpers';

let id = 0;

export function createFootstep(x: number, y: number, nX: number, nY: number) {
    const padding = 5;
    const timeToStartFade = 2;
    const timeToRemove = 3;

    if (
        x < padding ||
        y < padding ||
        x > document.documentElement.scrollWidth - padding ||
        y > document.documentElement.scrollHeight - padding
    ) {
        return;
    }

    const div = document.createElement('div');
    div.id = `__web-goose-step-${id++}__`;
    div.classList.add('__web-goose-step__');
    div.style.left = `${x + -2.5 * Math.random() * 5}px`;
    div.style.top = `${y - 2 + -2.5 * Math.random() * 5}px`;
    div.style.transform = `rotate(${Helpers.angle(x, y, nX, nY) + -5 + 10 * Math.random()}deg)`;
    document.body.appendChild(div);
    setTimeout(() => div.classList.add('__web-goose-step-fade__'), timeToStartFade * 1000);
    setTimeout(() => div.remove(), timeToRemove * 1000);
}
