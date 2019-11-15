import 'reflect-metadata'
import {DomUtils} from "../../shared/dom.utils";
import {BindingState} from "../states/binding.state";
import {CBinding, DecoratedBinding} from "./binding.decorator";
import {ControllerState} from "../states/controller.state";

export interface ControllerOptions {
    template: string;
    name: string;
    stylesheet?: string;
}

interface ExtendedElement extends HTMLElement {
    getEventListeners: () => { [index: string]: any[] }
}

export const CONTROLLER_DECORATOR_KEY = 'ControllerData';

const newState = (): BindingState => new BindingState();

type Constructor<T = {}> = new(...args: any[]) => T;

abstract class ControllerClass {
    public static options: ControllerOptions;

    private renderInElement: HTMLElement;
    private bindings: DecoratedBinding[];
    private state: ControllerState;
    public element: HTMLElement;

    constructor(renderInElement: HTMLElement, bindings: DecoratedBinding[]) {

    }
}

export class UpdateScheduler {
    updateScheduler: any;

    start(todo: () => void) {
        this.updateScheduler = setInterval(() => {
            todo();
        }, this.updateInterval);
    }

    constructor(private updateInterval: number = 10000) {

    }

}

export const Controller = (options: ControllerOptions): any => {
    // return (target) => {
    return <T extends Constructor>(target: T) => {
        Object.assign(target.prototype, {
            config: options,
        });

        // @ts-ignore
        class Controller extends target {
            public static options: ControllerOptions = options;
            state: ControllerState = new ControllerState();
            element: HTMLElement;

            eventListeners: {} = {};
            // oldData: any = {};
            config: ControllerOptions;
            public static template: string = options.template;

            bindingInstances: { [index: string]: DecoratedBinding } = {};

            constructor(private renderInElement?: HTMLElement, private bindings: DecoratedBinding[] = []) {
                super();
                this.renderTemplate();
            }

            setupBindings() {
                this.bindings.map((binding: DecoratedBinding) => {
                    // @ts-ignore
                    const b = new binding(this.element, this);
                    this.bindingInstances[(binding as any).bindingName] = b;
                });
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
                this.renderInElement.appendChild(this.element);
                for (let key in this.bindingInstances) { // .map((binding: _BindingClass) => {
                    this.bindingInstances[key].reduceMappings();
                }
                window['state'] = this.state;
            }


            renderTemplate() {
                console.log('rendering template');
                const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;
                templateContainer.innerHTML = Controller.options.template;
                this.element = templateContainer.firstChild as any;
                let templateChildren = Array.prototype.slice.call(templateContainer.querySelectorAll('*'));
                this.setupBindings();
                templateChildren.map((templateChild: HTMLElement) => {
                    for (let key in this.bindingInstances) { // .map((binding: _BindingClass) => {
                        this.bindingInstances[key].initBinding(templateChild);
                    }
                });
                this.addToDom(templateContainer.firstChild as HTMLElement);
                this['afterRender']();
            }

            updateTemplate() {
                console.log('updating template');
                for (let key in this.bindingInstances) {
                    this.bindingInstances[key].updateSchedule();
                }
            }


            restoreEventListeners() {
                DomUtils.walkThroughAllChilds(this.element, (ele) => {
                    const deepSelectorString: string = DomUtils.createDeepSelectorString(ele);
                    if (this.eventListeners[deepSelectorString]) {
                        for (let key in this.eventListeners[deepSelectorString]) {
                            this.eventListeners[deepSelectorString][key].map(listener => {
                                ele.addEventListener(key, listener.listener);
                            });
                        }
                    }
                });
            }

            addEventListeners(ele: ExtendedElement, listeners: any) {
                for (let key in listeners) {
                    listeners[key].map(listener => {
                        ele.addEventListener(key, listener.listener);
                    });
                }
            }

        }

        return Controller;
    }
};


