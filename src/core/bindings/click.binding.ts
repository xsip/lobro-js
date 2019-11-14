import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {State} from "../state";
import {Binding, BindingClass, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: '[click]',
})
export class ClickBinding implements BindingClass {
    state: State = new State();
    config: BindingOptions;

    constructor(public viewElement: HTMLElement, public view: View) {

    }

    public initBinding(templateChild: HTMLElement, hash: string, evalSt: string) {
        templateChild.addEventListener('click', async () => {
            // added await for try catch block!!
            await this.view.evalFromView(this.state.getEvalForHash(hash));
        });
        console.log((templateChild as any).getEventListeners('click')[0].listener.toString());

    }

    replaceHashInDom = (hash: string, newHash: string) => {
        const el = this.view.element.querySelector(`[${this.bindingKey}~="${hash}"]`);
        const hashList = el.getAttribute(this.bindingKey);
        el.setAttribute(this.bindingKey, hashList.replace(hash, newHash));
    };

    reduceMappings() {
        this.state.reduceMappings(this.replaceHashInDom);
    }

    selector: string;
    bindingKey: string;

    updateElement(templateChild: HTMLElement, hash: string, evalStr: string): void {
        // no update needed..
    }
}