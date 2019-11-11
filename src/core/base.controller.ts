import 'reflect-metadata'
import construct = Reflect.construct;

export interface ControllerOptions {
    template: string;
    name: string;
}

interface ExtendedElement extends HTMLElement {
    getEventListeners: () => { [index: string]: any[] }
}

export const CONTROLLER_DECORATOR_KEY = 'ControllerData';

export const Controller = (options: ControllerOptions) => {
    // return (target) => {
    return <T extends { new(...args: any[]): {} }>(target: T) => {
        Object.assign(target.prototype, {
            config: options,
        });
        // @ts-ignore
        return class BaseController extends target {

            config: ControllerOptions;
            displayTemplate: string;
            element: HTMLElement;
            updateInterval: number = 10000;
            updateScheduler: any;
            evalFuncCollection: any[] = [];
            lastValueCollection: any[] = [];
            onInitCalled = false;
            eventListeners: {} = {};

            constructor() {
                super();
                this.renderTemplate2();
                // this.startUpdateScheduler();
                this['version'] = 2;
                // this.config = Reflect.getMetadata(CONTROLLER_DECORATOR_KEY, this);
            }

            oldData: any = {};

            detectChanges() {
                let shouldUpdate: boolean = false;
                console.log(this['version']);
                for (let e in this) {
                    if (this.oldData[e] !== this[e]) {
                        this.oldData[e] = this[e];
                        shouldUpdate = true;

                    }

                }
                console.log('shouldUpdate', shouldUpdate);
                if (shouldUpdate) {
                    this.updateTemplate();
                }
            }

            createRandomHash = (length: number = 10): string => {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                return result;
            };

            createDeepSelectorString(ele: HTMLElement) {
                return this.getSelectorList(ele).join(' > ');
            }

            getSelectorList = (ele: HTMLElement, list: string[] = [], resolvedOneClassName: boolean = false) => {
                const selector: string = this.getSelector(ele);
                list.push(selector);

                if (selector.indexOf('#') !== -1) {
                    // stop at id level, since ids are unique!!
                    return list.reverse();
                }
                if (ele.parentElement) {
                    return this.getSelectorList(ele.parentElement, list, resolvedOneClassName);
                } else {
                    return list.reverse();
                }
            };

            getSelector = (ele: HTMLElement) => {
                if (ele.id) {
                    return '#' + ele.id.split(' ').join(('#'));
                }
                if (ele.className) {
                    return ele.nodeName + '.' + ele.className.split(' ').join(('.'));
                } else {
                    return ele.nodeName;
                }
            };

            renderTemplate2() {
                console.log('updating template');
                const tmp: HTMLDivElement = document.createElement('div') as HTMLDivElement;
                tmp.innerHTML = this.config.template;
                let list = Array.prototype.slice.call(tmp.querySelectorAll('*'));
                list.map((curE: HTMLElement) => {
                    let evalMatches = curE.innerText.match(/{{([^]*?)}}/g);
                    evalMatches = evalMatches ? evalMatches : [];
                    evalMatches.map((evalMatch: string) => {
                        let shouldReplace: boolean = true;
                        if (curE.children.length > 0 && curE.children[0].innerHTML.match(evalMatch)) {
                            shouldReplace = false;
                        }
                        if (shouldReplace) {
                            // this.displayTemplate = this.config.template;
                            const hash = this.createRandomHash();
                            this.evalFuncCollection[hash] = evalMatch;
                            const data = this.evalFunction(evalMatch);
                            this.lastValueCollection[hash] = data;
                            curE.innerHTML = curE.innerHTML.replace(evalMatch, `<!--${hash}!-->` + data + `<!--${hash}!-->`);
                            curE.setAttribute('watch-id', hash);
                        } else {
                            console.log('shouldnt replace yet', curE.nodeName);
                        }
                    });
                    // }
                });
                this.onAppend(document.body, () => {
                    if (!this.onInitCalled) {
                        this.onInitCalled = true;

                        this['afterRender']();
                    }
                });
                this.element = tmp.firstChild as HTMLElement;
                document.body.appendChild(this.element);
            }

            onAppend = (elem: HTMLElement, f: any) => {
                let observer = new MutationObserver(function (mutations) {
                    mutations.forEach((m) => {
                        if (m.addedNodes.length) {
                            f(m.addedNodes)
                        }
                    })
                });
                observer.observe(elem, {childList: true})
            };

            walkThroughAllChilds(ele: HTMLElement,
                                 cb: (ele: ExtendedElement) => void) {

                cb(ele as ExtendedElement);

                if (ele.childElementCount > 0) {
                    for (let i = 0; i < ele.childElementCount; i++) {
                        this.walkThroughAllChilds(ele.children[i] as HTMLElement, cb);
                    }
                }
            }

            saveEventListeners() {
                this.walkThroughAllChilds(this.element, (ele) => {
                    this.eventListeners[this.createDeepSelectorString(ele)] = ele.getEventListeners();
                });
                console.log(this.eventListeners);
            }

            restoreEventListeners() {
                this.walkThroughAllChilds(this.element, (ele) => {
                    const deepSelectorString: string = this.createDeepSelectorString(ele);
                    if (this.eventListeners[deepSelectorString]) {
                        for (let key in this.eventListeners[deepSelectorString]) {
                            this.eventListeners[deepSelectorString][key].map(listener => {
                                console.log(`Adding ${key} listener to ${deepSelectorString}`);
                                ele.addEventListener(key, listener.listener);
                                /*
                                (...args) => {
                                    listener.listener(...args);
                                }
                                 */
                            });
                        }
                    }
                });
                // console.log(this.eventListeners);
            }

            addEventListeners(ele: ExtendedElement, listeners: any) {
                for (let key in listeners) {
                    listeners[key].map(listener => {
                        console.log(`Adding ${key} listener to ${ele.nodeName}`);
                        ele.addEventListener(key, listener.listener);
                    });
                }
                // console.log(this.eventListeners);
            }

            updateTemplateOld() {
                console.log('updating template');
                this.saveEventListeners();
                for (let hash in this.evalFuncCollection) {
                    if (this.evalFuncCollection[hash]) {
                        const data = this.evalFunction(this.evalFuncCollection[hash]);
                        this.element.innerHTML =
                            this.element.innerHTML.replace(new RegExp(`<!--${hash}!-->([^]*?)<!--${hash}!-->`, 'g'), `<!--${hash}!-->` + data + `<!--${hash}!-->`);

                    }
                }
                // this.restoreEventListeners();
            }

            updateTemplate() {
                console.log('updating template');
                // this.saveEventListeners();
                for (let hash in this.evalFuncCollection) {
                    if (this.evalFuncCollection[hash]) {
                        const data = this.evalFunction(this.evalFuncCollection[hash]);
                        const el: HTMLElement = this.element.querySelector(`[watch-id="${hash}"]`);
                        const eventListenersBackup = (el as ExtendedElement).getEventListeners();
                        el.innerHTML = el.innerHTML.replace(new RegExp(`<!--${hash}!-->([^]*?)<!--${hash}!-->`, 'g'), `<!--${hash}!-->` + data + `<!--${hash}!-->`);
                        if (eventListenersBackup && !(el as ExtendedElement).getEventListeners()) {
                            console.log('had eventlisteners which are missing now!!');
                        } else {
                            console.log(eventListenersBackup);
                            console.log((el as ExtendedElement).getEventListeners());
                        }

                    }
                }
                // this.restoreEventListeners();
            }

            createElementFromString = (htmlString: string): HTMLElement => {
                const div = document.createElement('div');
                div.innerHTML = htmlString;

                // Change this to div.childNodes to support multiple top-level nodes
                return div as HTMLElement;
            };

            evalFunction = (funcStr: string): any => {
                const funcToEval: string = funcStr.replace('{{', '').replace('}}', '');
                return eval(funcToEval);
            };

            startUpdateScheduler() {
                this.updateScheduler = setInterval(() => {
                    this.detectChanges();
                }, this.updateInterval);
            }
        } as T;
    }
};

