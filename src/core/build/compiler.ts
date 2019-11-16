import {DecoratedBinding, DecoratedBindingByIndex} from "../decorators/binding.decorator";
import {BindingState, IState} from "../states/binding.state";
import {ControllerClass} from "../decorators/controller.decorator";
import {ControllerState} from "../states/controller.state";
import {GeneralUtils} from "../../shared/general.utils";

export interface CompiledTemplate {
    element: HTMLElement;
    controllerName: string;
    eventListenerState?: BindingState;
    bindingStates: { [index: string]: IState };
}

export class Compiler {
    private bindings: typeof DecoratedBinding[] = [];
    private bindingStates: { [index: string]: BindingState };

    constructor() {
    }

    compile(controller: typeof ControllerClass, bindings: typeof DecoratedBinding[]): CompiledTemplate {

        const compiledTemplate: CompiledTemplate = {element: undefined, bindingStates: {}, controllerName: ''};
        const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;
        templateContainer.innerHTML = controller.options.template;
        const element: HTMLElement = templateContainer.firstChild as any;

        const bindingsByIndex: DecoratedBindingByIndex = this.setupBindings(element, bindings);

        let templateChildren = Array.prototype.slice.call(templateContainer.querySelectorAll('*'));
        compiledTemplate.element = element;
        const eventListenerState: BindingState = new BindingState();
        templateChildren.map((templateChild: HTMLElement) => {
            for (let key in bindingsByIndex) { // .map((binding: _BindingClass) => {
                bindingsByIndex[key].initBinding(templateChild);
                bindingsByIndex[key].reduceMappings();
                compiledTemplate.bindingStates[key] = bindingsByIndex[key].state.getObject();
                if ((templateChild as any).getEventListeners()) {
                    const eventListenerHash = GeneralUtils.createRandomHash(10);
                    templateChild.setAttribute('eventlistener-hash', eventListenerHash);
                    eventListenerState.saveEvalForHash(eventListenerHash, (templateChild as any).getEventListeners());
                }
                // this.bindingsByIndex[key].state;
            }
        });
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