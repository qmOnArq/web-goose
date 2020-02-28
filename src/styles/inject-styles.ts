export function injectStyles() {
    const stylesId = '__web-goose-styles__';
    const stylesElement = document.getElementById(stylesId);
    if (stylesElement) {
        return Promise.resolve();
    }

    const node = document.createElement('style');
    node.innerHTML = require('./styles.css').toString();
    document.body.appendChild(node);
    return Promise.resolve();
}
