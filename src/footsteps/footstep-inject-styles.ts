export function footstepInjectStyles() {
    const stylesId = '__web-goose-styles-footstep__';
    const stylesElement = document.getElementById(stylesId);
    if (stylesElement) {
        return Promise.resolve();
    }

    const node = document.createElement('style');
    node.innerHTML = require('./footstep-styles.css').toString();
    node.id = stylesId;
    document.body.appendChild(node);
    return Promise.resolve();
}
