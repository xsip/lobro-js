import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {State} from "../state";
import {Binding, BindingClassPublic, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    propKey: 'click',
})
export class ClickBinding implements BindingClassPublic {
    state: State = new State();
    config: BindingOptions;

    constructor(public viewElement: HTMLElement, public view: View) {

    }

    public initBinding(templateChild: HTMLElement) {
        const elementHash: string = GeneralUtils.createRandomHash(5);
        templateChild.setAttribute(this.bindingKey, elementHash);

        this.state.saveEvalForHash(elementHash, templateChild.getAttribute(this.propKey));
        console.log(this.state.getEvalForHashList());
        templateChild.addEventListener('click', async () => {
            // added await for try catch block!!
            await this.view.evalFromView(this.state.getEvalForHash(elementHash));
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

    propKey: string;
    bindingKey: string;

    updateElement(templateChild: HTMLElement, hash: string, evalStr: string): void {
        // no update needed..
    }
}