import {DecoratedBinding, DecoratedBindingByIndex} from "../decorators/binding.decorator";
import {BindingState, IState} from "../states/binding.state";
import {ControllerClass} from "../decorators/controller.decorator";
import {ControllerState} from "../states/controller.state";
import {GeneralUtils} from "../../shared/general.utils";

export interface CompiledTemplate {
    element: HTMLElement;
    template?: string;
    controllerName: string;
    eventListenerState?: BindingState;
    bindingStates: { [index: string]: IState };
}

export class Compiler {

    constructor() {
    }

    compile(controller: typeof ControllerClass, bindings: typeof DecoratedBinding[]): CompiledTemplate {

        const compiledTemplate: CompiledTemplate = {element: undefined, bindingStates: {}, controllerName: ''};

        const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;
        templateContainer.innerHTML = controller.options.template;
        const element: HTMLElement = templateContainer.firstChild as any;

        const bindingsByIndex: DecoratedBindingByIndex = this.setupBindings(element, bindings);

        let templateChildren = Array.prototype.slice.call(templateContainer.querySelectorAll('*'));

        const eventListenerState: BindingState = new BindingState();
        templateChildren.map((templateChild: HTMLElement) => {
            for (let key in bindingsByIndex) { // .map((binding: _BindingClass) => {
                bindingsByIndex[key].initBinding(templateChild);
                bindingsByIndex[key].reduceMappings();
                compiledTemplate.bindingStates[key] = bindingsByIndex[key].state.getObject();
            }
        });
        compiledTemplate.element = element;
        compiledTemplate.template = compiledTemplate.element.outerHTML;
        compiledTemplate.controllerName = controller.options.name;
        compiledTemplate.eventListenerState = eventListenerState;
        window['evs'] = compiledTemplate.eventListenerState;
        return compiledTemplate;
    }

    setupBindings(element: HTMLElement, bindings: typeof DecoratedBinding[]): DecoratedBindingByIndex {
        const bindingsByIndex: DecoratedBindingByIndex = {};
        bindings.map((binding: typeof DecoratedBinding) => {
            // @ts-ignore
            const b = new binding(element, {element, evalFromView: this.evalFromView});
            bindingsByIndex[binding.bindingName] = b;
        });
        return bindingsByIndex;
    }

    evalFromView() {
        return 'init';
    }

}