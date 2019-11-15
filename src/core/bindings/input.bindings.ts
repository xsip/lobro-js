import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {BindingState} from "../states/binding.state";
import {Binding, CBinding, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: 'input'
})
export class InputBindings implements CBinding {
    state: BindingState = new BindingState();
    bindingKey: string;
    config: BindingOptions;
    selector: string;

    constructor(public viewElement: HTMLElement, public view: View) {

    }

    initBinding(templateChild: HTMLElement, hash: string, evalStr: string): void {
        if (evalStr) {
            const elementHash: string = GeneralUtils.createRandomHash(5);
            (templateChild as HTMLInputElement).value = this.view.evalFromView(evalStr);
            templateChild.addEventListener('input', (/*event: any*/) => {
                this.view.evalFromView(evalStr + ' = event.target.value;');
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
            this.noop(); // only for change detection
        });
    }

    private reavalInputValue(templateChild: HTMLInputElement, hash: string) {
        if (hash && this.state.getEvalForHash(hash)) {
            (templateChild as HTMLInputElement).value = this.view.evalFromView(this.state.getEvalForHash(hash));
        }
    }

    updateElement(templateChild: HTMLElement, hash?: string, evalStr?: string): void {
        this.reavalInputValue(templateChild as HTMLInputElement, hash);
    }
}