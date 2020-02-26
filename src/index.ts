import { GOOSE_IMAGE_PROMISE } from './assets/goose-image';
import { Goose } from './lib/goose';

GOOSE_IMAGE_PROMISE.then(() => {
    new Goose().init();
});
