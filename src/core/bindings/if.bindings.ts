import {View} from "./interfaces";
import {State} from "../state";
import {Binding, _BindingClass, BindingClass, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: '[if]',
})
export class IfBindings implements BindingClass {

    state: State = new State();
    bindingKey: string;
    selector: string;
    config: BindingOptions;
    constructor(public viewElement: HTMLElement, public view: View) {

    }

    /*public initBinding(templateChild: HTMLElement) {
        const elementHash: string = GeneralUtils.createRandomHash(5);
        templateChild.setAttribute(this.bindingKey, elementHash);

        this.state.saveEvalForHash(elementHash, templateChild.getAttribute(this.selector));

        if (!this.view.evalFromView(this.state.getEvalForHash(elementHash))) {
            templateChild.hidden = true;
        } else {
            templateChild.hidden = false;
        }
        // TODO: implement view property watcher to trigger change detection/ rerendering
    }*/


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

    initBinding(templateChild: HTMLElement, hash: string, evalStr: string): void {
        if (!this.view.evalFromView(evalStr)) {
            templateChild.hidden = true;
        } else {
            templateChild.hidden = false;
        }
    }
}