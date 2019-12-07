import {LoBroModule} from "../loBroModule";

export class EventListenerHook {

    eventListenersRegisteredForType: { [index: string]: number } = {};
    private module: LoBroModule;

    constructor() {
        this.hookAddEventListener();
    }

    setModule(module: LoBroModule) {
        this.module = module;

    }

    replaceLast(str, find, rep) {
        const a = str.split('');
        a[str.lastIndexOf(find)] = rep;
        return a.join("");
    }

    hookAddEventListener = () => {
        const oldAddEventListener = EventTarget.prototype.addEventListener;
        const _this = this;
        // @ts-ignore
        Element.prototype.addEventListener = function (type: string, fn: any, capture: any) {
            this.f = oldAddEventListener;
            this.f(type, (...args) => {
                fn(...args);
                _this.module.triggerAllChangeDetections();
            }, capture);
            if (!_this.eventListenersRegisteredForType[type]) {
                _this.eventListenersRegisteredForType[type] = -1;
            }
            _this.eventListenersRegisteredForType[type]++;
        };
    };

    eventFired = (...args: []) => {
        console.log('event fired: ', args);
    }

}
