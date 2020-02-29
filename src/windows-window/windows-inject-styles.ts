export function windowsInjectStyles() {
    const stylesId = '__web-goose-styles__';
    const stylesElement = document.getElementById(stylesId);
    if (stylesElement) {
        return Promise.resolve();
    }

    const node = document.createElement('style');
    node.innerHTML = require('./windows-styles.css').toString();
    node.id = stylesId;
    document.body.appendChild(node);
    return Promise.resolve();
}
