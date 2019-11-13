import 'reflect-metadata'
import {GeneralUtils} from "../shared/general.utils";
import {DomUtils} from "../shared/dom.utils";
import {State} from "./state";
import {InputBindings} from "./bindings/input.bindings";
import {ElementBindings} from "./bindings/element.bindings";
import * as path from "path";
import {IfBindings} from "./bindings/if.bindings";

export interface ControllerOptions {
    template: string;
    name: string;
    stylesheet?: string;
}

interface ExtendedElement extends HTMLElement {
    getEventListeners: () => { [index: string]: any[] }
}

export const CONTROLLER_DECORATOR_KEY = 'ControllerData';

const newState = (): State => new State();

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
            inputBindings: InputBindings;
            elementBindings: ElementBindings;
            ifBindings: IfBindings;
            constructor() {
                super();
                this.inputBindings = new InputBindings(this.element, this as any);
                this.elementBindings = new ElementBindings(this.element, this as any);
                this.ifBindings = new IfBindings(this.element, this as any);
                // require('demo-controller/demo-controller.scss');
                // require( this.config.stylesheet);
                this.renderTemplate();
                // let getStyle =
                // drequire(this.config.stylesheet);
                // eval(`require('${this.config.stylesheet}'(;`);
            }

            detectChanges() {
                let shouldUpdate: boolean = false;
                for (let e in this) {
                    // TODO: add detect changes to each bindings file and execute for belonging props only
                    // TODO: to not do a full detectChanges cycle!!
                    if (this.state.getOldControllerProperty(e) !== this[e]) {
                        this.state.setOldControllerProperty(e, this[e]);
                        // TODO: add deep object comparision!!
                        shouldUpdate = true;
                    }

                }
                // console.log('shouldUpdate', shouldUpdate);
                if (shouldUpdate) {
                    this.updateTemplate();
                }
            }

            evalFromView(evalData: string) {
                return eval(evalData);
            }

            addToDom(elementToAppend: HTMLElement) {
                this.element = elementToAppend;
                document.body.appendChild(this.element);
                // this.state.generateHashForEvalList();
                this.elementBindings.reduceMappings();
                this.inputBindings.reduceMappings();
                this.ifBindings.reduceMappings();
                window['state'] = this.state;
            }

            renderTemplate() {
                console.log('rendering template');
                const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;
                templateContainer.innerHTML = this.config.template;
                let templateChildren = Array.prototype.slice.call(templateContainer.querySelectorAll('*'));

                templateChildren.map((templateChild: HTMLElement) => {

                    this.inputBindings.initInputBindingsINeccesary(templateChild);
                    this.elementBindings.initElementBindingsIfNeccesary(templateChild);
                    this.ifBindings.initIfBindingsIfNeccessary(templateChild);
                });

                DomUtils.onAppend(document.body, () => {
                    if (!this.onInitCalled) {
                        this.onInitCalled = true;
                        this['afterRender']();
                    }
                });
                this.addToDom(templateContainer.firstChild as HTMLElement);
                // firstChild = actual template

            }

            updateTemplate() {

                console.log('updating template');
//                this.saveEventListeners();
                this.inputBindings.updateInputs();
                this.elementBindings.updateElements();
                this.ifBindings.updateIfElements();
                // this.restoreEventListeners();
            }

            /*afterRender() {
                //@ts-ignore
                this.controller.afterRender();
            }*/

            startUpdateScheduler() {
                this.updateScheduler = setInterval(() => {
                    this.detectChanges();
                }, this.updateInterval);
            }

            restoreEventListeners() {
                DomUtils.walkThroughAllChilds(this.element, (ele) => {
                    const deepSelectorString: string = DomUtils.createDeepSelectorString(ele);
                    if (this.eventListeners[deepSelectorString]) {
                        for (let key in this.eventListeners[deepSelectorString]) {
                            this.eventListeners[deepSelectorString][key].map(listener => {
                                // console.log(`Adding ${key} listener to ${deepSelectorString}`);
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
                        // console.log(`Adding ${key} listener to ${ele.nodeName}`);
                        ele.addEventListener(key, listener.listener);
                    });
                }
                // console.log(this.eventListeners);
            }

        }
    }
};


