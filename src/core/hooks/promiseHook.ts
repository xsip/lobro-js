import {LoBroModule} from "../loBroModule";

export class PromiseHook {

    private module: LoBroModule;

    constructor() {
        this.hookPromise();
    }

    setModule(module: LoBroModule) {
        this.module = module;

    }

    hookThen() {
        var originalThen = Promise.prototype.then;
        const _this = this;
        Promise.prototype.then = function (onFulfilled, onFailure) {
            // const _that = _this;
            return originalThen.call(this, function (value) {
                // console.log(value);
                const res = onFulfilled(value);
                _this.module.triggerAllChangeDetections();
                return res;
            }, onFailure);
        };
    }

    hookCatch() {
        var originalCatch = Promise.prototype.catch;
        const _this = this;
        Promise.prototype.catch = function (onrejected?: ((reason: any) => any) | undefined | null) {
            // const _that = _this;
            return originalCatch.call(this, function (value) {
                // console.log(value);
                const res = onrejected(value);
                _this.module.triggerAllChangeDetections();
                return res;
            });
            // console.log('HOOK');
            // _this.module.triggerAllChangeDetections();
            // return res;
        };
    }

    hookPromise = () => {
        this.hookCatch();
        this.hookThen();
    };

}