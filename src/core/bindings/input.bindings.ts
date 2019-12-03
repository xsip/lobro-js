import {View} from "./interfaces";
import {BindingState} from "../states/binding.state";
import {Binding, CBinding, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: '[input]'
})
export class InputBindings implements CBinding {

    state: BindingState = new BindingState();
    bindingKey: string;
    config: BindingOptions;
    selector: string;
    bodyClickListenerAdded = false;

    constructor(public viewElement: HTMLElement, public view: View) {

    }

    async bodyClickListener(event: Event) {
        if ((event.target as HTMLElement).getAttribute('input-bind')) {
            const hash = (event.target as HTMLElement).getAttribute('input-bind');
            this.view.evalFromView(this.state.getEvalForHash(hash) + ' = event.target.value;');
        }
    }

    initBinding(templateChild: HTMLElement, hash: string, evalStr: string): void {

        if (!this.bodyClickListenerAdded) {
            this.bodyClickListenerAdded = true;
            document.body.addEventListener('input', this.bodyClickListener.bind(this));
        }

        if (evalStr) {
            (templateChild as HTMLInputElement).value = this.view.evalFromView(evalStr);
        }

    }


    private reavalInputValue(templateChild: HTMLInputElement, hash: string) {
        if (hash && this.state.getEvalForHash(hash)) {
            (templateChild as HTMLInputElement).value = this.view.evalFromView(this.state.getEvalForHash(hash));
        }
    }

    updateElement(templateChild: HTMLElement, hash?: string, evalStr?: string): void {
        this.reavalInputValue(templateChild as HTMLInputElement, hash);
    }


    lastElementUpdated(): void {
    }
}
