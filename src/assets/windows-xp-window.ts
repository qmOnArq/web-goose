export function createWinXpWindow() {
    const width = 200;
    const left = 100;
    const top = 100;
    const content = '';
    const title = 'Title';

    const html = `
<div class="__web-goose-xp-base__ __web-goose-xp-holder__" style="
    width: ${width}px;
    left: ${left}px;
    top: ${top}px;
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
                <span class="__web-goose-xp-base__ __web-goose-xp-corner-button__"></span>
            </a>
        </li>
        <li class="__web-goose-xp-base__">
            <a
                class="__web-goose-xp-base__"
                style="height: 30px; width: 25px;"
            >
                <span
                    class="__web-goose-xp-base__ __web-goose-xp-corner-button__"
                    style="background-position: -28px 0;"
                ></span>
            </a>
        </li>
        <li class="__web-goose-xp-base__">
            <a
                class="__web-goose-xp-base__"
                style="width: 28px; height: 30px;"
            >
                <span
                    class="__web-goose-xp-base__ __web-goose-xp-corner-button__"
                    style="background-position: -52px 0;"
                ></span>
            </a>
        </li>
    </ul>
    <div class="__web-goose-xp-base__ __web-goose-xp-content-wrapper__">
        <div
            class="__web-goose-xp-base__"
            style="height: 100%;"
        >
            ${content}
        </div>
    </div>
</div>`;

    const div = document.createElement('div');
    div.innerHTML = html.trim();
    const dom = div.firstChild!;
    document.body.appendChild(dom);
    return dom;
}
