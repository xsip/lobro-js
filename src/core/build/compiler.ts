import {DecoratedBinding, DecoratedBindingByIndex} from "../decorators/binding.decorator";
import {BindingState, IState} from "../states/binding.state";

export interface CompiledTemplate {
    element: HTMLElement;
    bindingStates: { [index: string]: IState };
}

export class Compiler {
    private bindingsByIndex: DecoratedBindingByIndex = {};
    private bindings: DecoratedBinding[] = [];
    private bindingStates: { [index: string]: BindingState };
    private template: string;
    private element: HTMLElement;
    private compiledTemplate: CompiledTemplate = {element: undefined, bindingStates: {}};

    constructor(template, bindings: DecoratedBinding[]) {
        this.template = template;
        this.bindings = bindings;
    }

    compile(): CompiledTemplate {
        this.setupBindings();
        const templateContainer: HTMLDivElement = document.createElement('div') as HTMLDivElement;
        templateContainer.innerHTML = this.template;
        this.element = templateContainer.firstChild as any;

        let templateChildren = Array.prototype.slice.call(templateContainer.querySelectorAll('*'));
        this.compiledTemplate.element = this.element;
        templateChildren.map((templateChild: HTMLElement) => {
            for (let key in this.bindingsByIndex) { // .map((binding: _BindingClass) => {
                this.bindingsByIndex[key].initBinding(templateChild);
                this.bindingsByIndex[key].reduceMappings();
                this.compiledTemplate.bindingStates[key] = this.bindingsByIndex[key].state.getObject();

                    // this.bindingsByIndex[key].state;
            }
        });
        return this.compiledTemplate;
    }

    setupBindings() {
        this.bindings.map((binding: DecoratedBinding) => {
            // @ts-ignore
            const b = new binding(this.element, this);
            // @ts-ignore
            this.bindingsByIndex[binding.bindingName] = b;
        });
    }

    evalFromView() {
        return 'init';
    }

}