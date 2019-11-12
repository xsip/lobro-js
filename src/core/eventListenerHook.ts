import {LoBroModule} from "./loBroModule";

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
        console.log('rewriting event listener');
        /*EventTarget.prototype.addEventListener */
        // @ts-ignore
        Element.prototype._addEventListener = function (type: any, fn: any, capture: any) {
            this.f = oldAddEventListener;
            this.f(type, (...args) => {
                window['func'] = fn;
                _this.eventFired(...args);
                // let fnStr =  _this.replaceLast((fn as Function).toString(), '}', `;console.log(this); console.log(_that);}`);
                // console.log('lol');

                fn(...args);
                // eval(fnStr)(args);
                console.log('calling change detection...');
                _this.module.triggerAllChangeDetections();
                // console.log((fn as Function).toString());
                // console.log((fn as Function).caller );
                // console.log((fn as Function).prototype);
                // fn.parent['detectChanges']();
            }, capture);
            console.log('Added Event Listener: on' + type);

            if (!_this.eventListenersRegisteredForType[type]) {
                _this.eventListenersRegisteredForType[type] = -1;
            }
            _this.eventListenersRegisteredForType[type]++;
        };
    };

    eventFired = (...args: any[]) => {
        console.log('event fired: ', args);
    }

}