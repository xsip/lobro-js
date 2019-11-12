import {LoBroModule} from "../loBroModule";

console.log('polyfills loaded');
//@ts-ignore
Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype.addEventListener = function (a, b, c) {
    if (c == undefined)
        c = false;
    this._addEventListener(a, b, c);
    if (!this.eventListenerList)
        this.eventListenerList = {};
    if (!this.eventListenerList[a])
        this.eventListenerList[a] = [];
    //this.removeEventListener(a,b,c); // TODO - handle duplicates..
    this.eventListenerList[a].push({listener: b, useCapture: c});
};
//@ts-ignore
Element.prototype.getEventListeners = function (a) {
    if (!this.eventListenerList)
        this.eventListenerList = {};
    if (a == undefined)
        return this.eventListenerList;
    return this.eventListenerList[a];
};
//@ts-ignore
Element.prototype.clearEventListeners = function (a) {
    if (!this.eventListenerList)
        this.eventListenerList = {};
    if (a == undefined) {
        for (var x in (this.getEventListeners())) this.clearEventListeners(x);
        return;
    }
    var el = this.getEventListeners(a);
    if (el == undefined)
        return;
    for (var i = el.length - 1; i >= 0; --i) {
        var ev = el[i];
        this.removeEventListener(a, ev.listener, ev.useCapture);
    }
};
//@ts-ignore
Element.prototype._removeEventListener = Element.prototype.removeEventListener;
Element.prototype.removeEventListener = function (a, b, c) {
    if (c == undefined)
        c = false;
    this._removeEventListener(a, b, c);
    if (!this.eventListenerList)
        this.eventListenerList = {};
    if (!this.eventListenerList[a])
        this.eventListenerList[a] = [];

    // Find the event in the list
    for (var i = 0; i < this.eventListenerList[a].length; i++) {
        if (this.eventListenerList[a][i].listener == b, this.eventListenerList[a][i].useCapture == c) { // Hmm..
            this.eventListenerList[a].splice(i, 1);
            break;
        }
    }
    if (this.eventListenerList[a].length == 0)
        delete this.eventListenerList[a];
};

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
        // console.log('rewriting event listener');
        /*EventTarget.prototype.addEventListener */
        // @ts-ignore
        Element.prototype._addEventListener = function (type: any, fn: any, capture: any) {
            this.f = oldAddEventListener;
            this.f(type, (...args) => {
                window['func'] = fn;
                // _this.eventFired(...args);
                // let fnStr =  _this.replaceLast((fn as Function).toString(), '}', `;console.log(this); console.log(_that);}`);
                // console.log('lol');

                fn(...args);
                // eval(fnStr)(args);
                // console.log('calling change detection...');
                // console.log('calling change detection...');
                _this.module.triggerAllChangeDetections();
                // console.log((fn as Function).toString());
                // console.log((fn as Function).caller );
                // console.log((fn as Function).prototype);
                // fn.parent['detectChanges']();
            }, capture);
            // console.log('Added Event Listener: on' + type);

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