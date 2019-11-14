import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {State} from "../state";
import {ExtendedElement} from "../../shared/dom.utils";
import {BaseBinding} from "./base.binding";
import {Binding, BindingClass, BindingClassPublic, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    propKey: 'if',
})
export class IfBindings implements BindingClassPublic {

    state: State = new State();
    bindingKey: string;
    propKey: string;
    config: BindingOptions;
    constructor(public viewElement: HTMLElement, public view: View) {

    }

    public initBinding(templateChild: HTMLElement) {
        const elementHash: string = GeneralUtils.createRandomHash(5);
        templateChild.setAttribute(this.bindingKey, elementHash);

        this.state.saveEvalForHash(elementHash, templateChild.getAttribute(this.propKey));

        if (!this.view.evalFromView(this.state.getEvalForHash(elementHash))) {
            templateChild.hidden = true;
        } else {
            templateChild.hidden = false;
        }
        // TODO: implement view property watcher to trigger change detection/ rerendering
    }


    replaceHashInDom = (hash: string, newHash: string) => {
        const el = this.view.element.querySelector(`[${this.bindingKey}~="${hash}"]`);
        const hashList = el.getAttribute(this.bindingKey);
        el.setAttribute(this.bindingKey, hashList.replace(hash, newHash));
    };

    reduceMappings() {
        this.state.reduceMappings(this.replaceHashInDom);
    }

    updateElement(el: HTMLElement, hash: string, evalStr: string): void {

        if (!this.view.evalFromView(this.state.getEvalForHash(hash))) {
            el.hidden = true;
        } else {
            el.hidden = false;
        }
    }
}