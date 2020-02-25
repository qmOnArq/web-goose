import { WebGoose } from './lib/web-goose';
import { GOOSE_IMAGE_PROMISE } from './assets/goose-image';

GOOSE_IMAGE_PROMISE.then(() => {
    new WebGoose().init();
});
