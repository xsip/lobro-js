import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {BindingState} from "../states/binding.state";
import {Binding, CBinding, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: '[click]',
})
export class ClickBinding implements CBinding {
    state: BindingState = new BindingState();
    config: BindingOptions;

    constructor(public viewElement: HTMLElement, public view: View) {

    }

    public initBinding(templateChild: HTMLElement, hash: string, evalSt: string) {
        templateChild.addEventListener('click', async () => {
            // added await for try catch block!!
            await this.view.evalFromView(this.state.getEvalForHash(hash));
        });
        // console.log((templateChild as any).getEventListeners('click')[0].listener.toString());

    }

    selector: string;
    bindingKey: string;

    updateElement(templateChild: HTMLElement, hash: string, evalStr: string): void {
        // no update needed..
    }
}