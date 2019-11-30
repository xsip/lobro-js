import {ControllerClass, ControllerOptions} from "../decorators/controller.decorator";
import {DecoratedBinding} from "../decorators/binding.decorator";
import {DomUtils, ExtendedElement} from "../../shared/dom.utils";
import {CompiledTemplate} from "../build/compiler";
import {ControllerState} from "../states/controller.state";

export class Renderer {
    state: ControllerState = new ControllerState();
    element: HTMLElement;
    elementContainer: HTMLElement;
    eventListeners: {} = {};

    config: ControllerOptions;
    bindingInstances: { [index: string]: DecoratedBinding } = {};
    constructor(private controller: ControllerClass, private bindings: typeof DecoratedBinding[] = [], private options: ControllerOptions) {

    }

    createElement = () => {
        this.elementContainer = document.createElement('div') as HTMLDivElement;

        this.elementContainer.innerHTML = this.options.template;

        this.element = this.elementContainer.firstChild as any;
        return this.element;
    };

    setupBindings() {
        this.bindings.map((binding: typeof DecoratedBinding) => {
            // @ts-ignore
            const b = new binding(this.element, this.controller);
            this.bindingInstances[binding.bindingName] = b;
        });
    }

    detectChanges() {
        let shouldUpdate: boolean = false;
        for (let e in this.controller) {
            // TODO: add detect changes to each bindings file and execute for belonging props only
            // TODO: to not do a full detectChanges cycle!!
            if (this.state.getOldControllerProperty(e) !== (this.controller as any)[e]) {
                this.state.setOldControllerProperty(e, (this.controller as any)[e]);
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
        const res = this.controller.evalFromView(evalData);
        console.log(res);
    }

    addToDom(elementToAppend: HTMLElement, appendTo: HTMLElement) {
        this.element = elementToAppend;
        appendTo.appendChild(this.element);
        for (let key in this.bindingInstances) { // .map((binding: _BindingClass) => {
            this.bindingInstances[key].reduceMappings();
        }
        window['state'] = this.state;
    }


    renderTemplate(appendTo: HTMLElement) {

        console.log('rendering template');

        this.setupBindings();
        let templateChildren = Array.prototype.slice.call(this.elementContainer.querySelectorAll('*'));

        templateChildren.map((templateChild: HTMLElement) => {
            for (let key in this.bindingInstances) { // .map((binding: _BindingClass) => {
                this.bindingInstances[key].initBinding(templateChild);
            }
        });
        this.addToDom(this.element, appendTo);
        this.controller['afterRender']();
    }

    updateTemplate() {
        console.log('updating template');
        for (let key in this.bindingInstances) {
            console.log(key, 'update');
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

    public createInstance(compiledTemplate: CompiledTemplate, appendTo: HTMLElement): void {

        // const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;
        // templateContainer.innerHTML = Controller.options.template;
        const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;

        templateContainer.innerHTML = compiledTemplate.template;
        this.element = compiledTemplate.element; // templateContainer.firstChild as any;

        this.setupBindings();
        for (let key in this.bindingInstances) {
            if (compiledTemplate.bindingStates[key]) {
                this.bindingInstances[key].state.setState(compiledTemplate.bindingStates[key]);
            } else {
                console.log('no state saved for ', key);
            }

        }

        let templateChildren = Array.prototype.slice.call(this.element.querySelectorAll('*'));

        templateChildren.map((templateChild: HTMLElement) => {
            const hash: string = templateChild.getAttribute('eventlistener-hash');
            if (hash) {
                this.addEventListeners(templateChild as ExtendedElement, compiledTemplate.eventListenerState.getEvalForHash(hash));
            }
        });

        this.addToDom(this.element, appendTo);
        // this['afterRender']();
        // this.detectChanges();
    }
}