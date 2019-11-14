import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {State} from "../state";
import {Binding, BindingClass, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: 'input'
})
export class InputBindings implements BindingClass {
    state: State = new State();
    bindingKey: string;
    constructor(public viewElement: HTMLElement, public view: View) {

    }

    initBinding(templateChild: HTMLElement, hash: string, evalStr: string): void {
        // has value binding
        if (evalStr) {
            // this.handleBinding(templateChild);
            const elementHash: string = GeneralUtils.createRandomHash(5);
            (templateChild as HTMLInputElement).value = this.view.evalFromView(evalStr); //templateChild.getAttribute(this.identifyKey)
            templateChild.addEventListener('input', (/*event: any*/) => {
                this.view.evalFromView(/*templateChild.getAttribute(this.identifyKey)*/ evalStr + ' = event.target.value;');
            });
        } else {
            // TODO: enable selector bindings and move to selector binding since input
            // TODO: wont get sharted to this binding after checkup moved to binding decorator
            this.emptyInputHookForChangeDetectionTrigger(templateChild);
        }
    }

    noop() {
    }

    private emptyInputHookForChangeDetectionTrigger(element: HTMLElement) {
        // TODO: add check if there allready is any input listener!!
        element.addEventListener('input', (/*event: any*/) => {
            this.noop();
            // only for change detection
        });
    }

    private reavalInputValue(templateChild: HTMLInputElement, hash: string) {
        if (hash && this.state.getEvalForHash(hash)) {
            (templateChild as HTMLInputElement).value = this.view.evalFromView(this.state.getEvalForHash(hash));
        }
    }

    replaceHashInDom = (hash: string, newHash: string) => {
        const el = this.view.element.querySelector(`[${this.bindingKey}~="${hash}"]`);
        const hashList = el.getAttribute(this.bindingKey);
        el.setAttribute(this.bindingKey, hashList.replace(hash, newHash));
    };

    reduceMappings() {
        this.state.reduceMappings(this.replaceHashInDom);
    }

    config: BindingOptions;
    selector: string;

    updateElement(templateChild: HTMLElement, hash?: string, evalStr?: string): void {
        this.reavalInputValue(templateChild as HTMLInputElement, hash);
    }
}