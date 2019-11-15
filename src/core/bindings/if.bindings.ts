import {View} from "./interfaces";
import {BindingState} from "../states/binding.state";
import {Binding, DecoratedBinding, CBinding, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: '[if]',
})
export class IfBindings implements CBinding {

    state: BindingState = new BindingState();
    bindingKey: string;
    selector: string;
    config: BindingOptions;

    constructor(public viewElement: HTMLElement, public view: View) {

    }


    updateElement(el: HTMLElement, hash: string, evalStr: string): void {

        if (!this.view.evalFromView(this.state.getEvalForHash(hash))) {
            el.hidden = true;
        } else {
            el.hidden = false;
        }
    }

    initBinding(templateChild: HTMLElement, hash: string, evalStr: string): void {
        if (!this.view.evalFromView(evalStr)) {
            templateChild.hidden = true;
        } else {
            templateChild.hidden = false;
        }
    }
}