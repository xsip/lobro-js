import 'reflect-metadata'
import {Util} from "./util";
import {DomUtils} from "./dom.utils";

export interface ControllerOptions {
    template: string;
    name: string;
}

interface ExtendedElement extends HTMLElement {
    getEventListeners: () => { [index: string]: any[] }
}

export const CONTROLLER_DECORATOR_KEY = 'ControllerData';


const newState = (): State => new State();

export class State {
    private evalForHash: any[] = [];
    private hashForEval: any[] = [];
    private lastValueForHash: any[] = [];
    private oldControllerData: any = {};

    constructor() {

    }

    getEvalForHash(hash: string): string | undefined {
        return this.evalForHash[hash];
    }

    getEvalForHashList(): any[] {
        return this.evalForHash;
    }

    saveEvalForHash(hash: string, evalData: string): void {
        this.evalForHash[hash] = evalData;
        // this.hashForEval[evalData] = hash;
    }

    generateHashForEvalList() {
        for (let hash in this.evalForHash) {
            this.hashForEval[this.evalForHash[hash]] = hash;
        }
    }

    reduceMappings = (replaceHashInDom: (hash: string, newHash: string) => void) => {
        const tmpEvalForHash: any = {};
        const toIgnore: string[] = [];
        for (let hash in this.evalForHash) {
            // console.log(hash);
            for (let hash2 in this.evalForHash) {
                if (hash2 !== hash && toIgnore.indexOf(hash2) === -1 && toIgnore.indexOf(hash) === -1 && this.evalForHash[hash2] === this.evalForHash[hash]) {
                    console.log(`${hash} has same eval as ${hash2} ( ${this.evalForHash[hash]} ).. reducing!`);
                    toIgnore.push(hash2);
                    replaceHashInDom(hash2, hash);
                }
            }
        }
        toIgnore.map(i => delete this.evalForHash[i]).filter(i => i !== null && i !== undefined);
        this.generateHashForEvalList();
    };

    getHashForEval(hash: string): string | undefined {
        return this.evalForHash[hash];
    }

    setOldControllerProperty(prop: string, value: any): void {
        this.oldControllerData[prop] = value;
    }

    getOldControllerProperty(prop: string) {
        return this.oldControllerData[prop];
    }

    getLastValueForHash(hash: string) {
        return this.lastValueForHash[hash];
    }

    setLastValueForHash(hash: string, val: any): void {
        this.lastValueForHash[hash] = val;
    }
}

type Constructor<T = {}> = new(...args: any[]) => T;
export const Controller = (options: ControllerOptions) => {
    // return (target) => {
    return <T extends Constructor>(target: T) => {
        Object.assign(target.prototype, {
            config: options,
        });

        // @ts-ignore
        return class extends target {
            state: State = newState();
            element: HTMLElement;
            updateInterval: number = 10000;
            updateScheduler: any;
            // evalForHash: any[] = [];
            // hashForEval: any[] = [];
            // lastValueCollection: any[] = [];
            onInitCalled = false;
            eventListeners: {} = {};
            // oldData: any = {};
            config: ControllerOptions;

            constructor() {
                super();
                this.renderTemplate();
                // this.controller['detectChanges'] = this.detectChanges;
            }

            detectChanges() {
                let shouldUpdate: boolean = false;
                for (let e in this) {
                    if (this.state.getOldControllerProperty(e) !== this[e]) {
                        this.state.setOldControllerProperty(e, this[e]);
                        shouldUpdate = true;
                    }

                }
                console.log('shouldUpdate', shouldUpdate);
                if (shouldUpdate) {
                    this.updateTemplate();
                }
            }

            renderEvalInElement(curE: HTMLElement, evalMatch: string) {
                console.log(DomUtils.getDirectInnerText(curE));
                let shouldReplace: boolean = true;
                //if children also matches the same eval, don't replace value in template!
                // if (curE.children.length > 0 && (curE.children[0] as HTMLElement).innerText.match(evalMatch)) {
                if (curE.children.length > 0 && DomUtils.getDirectInnerText(curE.children[0] as HTMLElement).match(evalMatch)) {
                    shouldReplace = false;
                    if (!curE.children[0].getAttribute('watch-id')) {
                        this.renderEvalInElement(curE.children[0] as any, evalMatch);
                        // console.log('recrusive', curE.children[0]);
                    }
                } else {
                    let hash = this.state.getHashForEval(evalMatch);
                    if (curE.getAttribute('watch-id')) {
                        console.log('allready has watch id..');
                        return;
                        // MAKE WATCH ID A LIST!!
                        // hash = curE.getAttribute('watch-id');
                        // return;
                    }
                    console.log('going on..');
                    // this.displayTemplate = this.config.template;
                    // same eval can use the same hash!! UPDATE TO QUERYSELECTOR ALL


                    if (!hash) {
                        hash = Util.createRandomHash();
                        this.state.saveEvalForHash(hash, evalMatch);
                        // this.state.hashForEval[evalMatch] = hash;
                    }


                    const data = this.evalTemplateFunction(evalMatch);
                    this.state.setLastValueForHash(hash, data);

                    curE.innerHTML = curE.innerHTML.replace(evalMatch, `<!--${hash}!-->` + data + `<!--${hash}!-->`);
                    curE.setAttribute('watch-id', hash);

                }
            }

            renderTemplate() {
                console.log('rendering template');

                const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;
                templateContainer.innerHTML = this.config.template;

                // console.log(this['version']);
                let templateChildren = Array.prototype.slice.call(templateContainer.querySelectorAll('*'));

                templateChildren.map((templateChild: HTMLElement) => {
                    let evalMatches = DomUtils.getDirectInnerText(templateChild).match(/{{([^]*?)}}/g);
                    // evalMatches = evalMatches ? evalMatches : [];
                    if (evalMatches) {
                        console.log('eval matches', evalMatches);
                        let log = true;
                        evalMatches.map((evalMatch: string) => {
                            if(log) {
                                console.log('REPLACING REPLACING, ', evalMatch);
                            }

                            this.renderEvalInElement(templateChild, evalMatch);
                        });
                    }

                    // }
                });

                DomUtils.onAppend(document.body, () => {
                    if (!this.onInitCalled) {
                        this.onInitCalled = true;

                        this['afterRender']();
                    }
                });
                // firstChild = actual template
                this.element = templateContainer.firstChild as HTMLElement;
                document.body.appendChild(this.element);
                // this.state.generateHashForEvalList();
                this.state.reduceMappings(this.replaceHashInDom);
                window['state'] = this.state;
                console.log(this.state);
            }

            reRenderElement(el: HTMLElement, hash: string, data: any) {
                const eventListenersBackup = (el as ExtendedElement).getEventListeners();
                el.innerHTML = el.innerHTML.replace(new RegExp(`<!--${hash}!-->([^]*?)<!--${hash}!-->`, 'g'), `<!--${hash}!-->` + data + `<!--${hash}!-->`);

                if (eventListenersBackup && !(el as ExtendedElement).getEventListeners()) {
                    console.log('had eventlisteners which are missing now!!');
                    this.addEventListeners(el as ExtendedElement, eventListenersBackup);
                } else {
                    // console.log(eventListenersBackup);
                    // console.log((el as ExtendedElement).getEventListeners());
                }

            }

            replaceHashInDom = (hash: string, newHash: string) => {
                const el = this.element.querySelector(`[watch-id="${hash}"]`);
                const eventListenersBackup = (el as ExtendedElement).getEventListeners();
                el.innerHTML = el.innerHTML.replace(new RegExp(hash, 'g'), newHash);
                el.setAttribute('watch-id', newHash);
                if (eventListenersBackup && !(el as ExtendedElement).getEventListeners()) {
                    console.log('had eventlisteners which are missing now!!');
                    this.addEventListeners(el as ExtendedElement, eventListenersBackup);
                } else {
                    // console.log(eventListenersBackup);
                    // console.log((el as ExtendedElement).getEventListeners());
                }

            };

            updateTemplate() {

                console.log('updating template');
                this.saveEventListeners();

                for (let hash in this.state.getEvalForHashList()) {

                    if (this.state.getEvalForHash(hash)) {

                        const data = this.evalTemplateFunction(this.state.getEvalForHash(hash));
                        const elList: HTMLElement[] = Array.prototype.slice.call(this.element.querySelectorAll(`[watch-id="${hash}"]`));

                        // query selector all since we are using a hash mutliple times if possible!!
                        elList.map(el => {
                            this.reRenderElement(el, hash, data);
                        });

                    }
                }
                // this.restoreEventListeners();
            }


            evalTemplateFunction = (funcStr: string): any => {
                const funcToEval: string = funcStr.replace('{{', '').replace('}}', '');
                // .replace(/this/g, 'this.controller');
                //console.log(funcToEval);
                // console.log(eval(funcToEval));
                // @ts-ignore
                return eval(funcToEval);
            };

            /*afterRender() {
                //@ts-ignore
                this.controller.afterRender();
            }*/

            startUpdateScheduler() {
                this.updateScheduler = setInterval(() => {
                    this.detectChanges();
                }, this.updateInterval);
            }

            saveEventListeners() {
                DomUtils.walkThroughAllChilds(this.element, (ele) => {
                    this.eventListeners[DomUtils.createDeepSelectorString(ele)] = (ele as ExtendedElement).getEventListeners();
                });
                // console.log(this.eventListeners);
            }

            restoreEventListeners() {
                DomUtils.walkThroughAllChilds(this.element, (ele) => {
                    const deepSelectorString: string = DomUtils.createDeepSelectorString(ele);
                    if (this.eventListeners[deepSelectorString]) {
                        for (let key in this.eventListeners[deepSelectorString]) {
                            this.eventListeners[deepSelectorString][key].map(listener => {
                                console.log(`Adding ${key} listener to ${deepSelectorString}`);
                                ele.addEventListener(key, listener.listener);
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

        }
    }
};


