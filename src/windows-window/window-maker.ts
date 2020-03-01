let id = 0;

export function createWinXpWindow(
    type: 'image' | 'text',
    content: string,
    x: number,
    y: number,
    isLeftX: boolean,
    isTopY: boolean,
) {
    const contentHtml = type === 'text' ? `<textarea>${content}</textarea>` : `<img src="${content}">`;
    const title = type === 'text' ? 'Notepad' : 'Image Viewer';

    const html = `
<div id="__web-goose-xp-window-${id++}__" class="__web-goose-xp-base__ __web-goose-xp-holder__" style="
    width: 100px;
    left: -1000px;
    top: -1000px;
">
    <h2 class="__web-goose-xp-base__">
        <span class="__web-goose-xp-base__"></span>
        ${title}
    </h2>
    <ul class="__web-goose-xp-base__">
        <li class="__web-goose-xp-base__">
            <a
                class="__web-goose-xp-base__"
                style="width: 28px; height: 30px;"
            >
                <span class="__web-goose-xp-base__ __web-goose-xp-corner-button__ __web-goose-xp-minimize__"></span>
            </a>
        </li>
        <li class="__web-goose-xp-base__">
            <a
                class="__web-goose-xp-base__"
                style="height: 30px; width: 25px;"
            >
                <span class="__web-goose-xp-base__ __web-goose-xp-corner-button__ __web-goose-xp-maximize__"></span>
            </a>
        </li>
        <li class="__web-goose-xp-base__">
            <a
                class="__web-goose-xp-base__"
                style="width: 28px; height: 30px;"
            >
                <span class="__web-goose-xp-base__ __web-goose-xp-corner-button__ __web-goose-xp-close__"></span>
            </a>
        </li>
    </ul>
    <div class="__web-goose-xp-base__ __web-goose-xp-content-wrapper__">
        <div
            class="__web-goose-xp-base__ __web-goose-xp-content-inner-wrapper__"
        >
            ${contentHtml}
        </div>
    </div>
</div>`;

    const width = 300;
    const height = 200;
    let left = x;
    let top = y;

    const div = document.createElement('div');
    div.innerHTML = html.trim();
    const dom = div.firstChild! as HTMLElement;

    dom.style.width = `${width}px`;
    dom.style.height = `${height}px`;

    document.body.appendChild(dom);

    if (type === 'image') {
        const img = dom.querySelector('img')!;
        const rect = img.getBoundingClientRect();
        const imgHeight = rect.height;
        dom.style.height = `${imgHeight}px`;
    }

    const rect = dom.getBoundingClientRect();

    if (!isLeftX) {
        left = left - rect.width;
    }

    if (!isTopY) {
        top = top - rect.height - 30;
    }

    dom.style.left = `${left}px`;
    dom.style.top = `${top - document.documentElement.scrollTop}px`;

    const closed = new Promise<void>(resolve => {
        const close = dom.querySelector('.__web-goose-xp-close__')!;
        close.addEventListener('click', () => {
            dom.remove();
            resolve();
        });
    });

    const result: WindowsXpWindow = {
        node: dom,
        left,
        top,
        closed,
        type,
        content,
        width: rect.width,
        height: rect.height + 30,
    };

    return result;
}

export interface WindowsXpWindow {
    node: HTMLElement;
    left: number;
    top: number;
    width: number;
    height: number;
    type: 'image' | 'text';
    content: string;
    closed: Promise<void>;
}
