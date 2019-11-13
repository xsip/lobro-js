import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {State} from "../state";
import {ExtendedElement} from "../../shared/dom.utils";


export class IfBindings<T = any> {
    state: State = new State();
    bindingKey: string = 'if-bind';
    identifyKey: string = 'if';
    elementCopyForHash: any = {};

    constructor(private viewElement: HTMLElement, private view: View) {

    }

    public initIfBindingsIfNeccessary(templateChild: HTMLElement) {

        if (templateChild.hasAttribute(this.identifyKey)) {
            // console.log('adding binding for ', templateChild.id);
            this.handleBinding(templateChild);
        }
    }

    private handleBinding(element: HTMLElement) {

        if (!element.getAttribute(this.bindingKey)) {
            const elementHash: string = GeneralUtils.createRandomHash(5);

            // (element as HTMLElement).value = this.view.evalFromView(element.getAttribute(this.identifyKey));
            element.setAttribute(this.bindingKey, elementHash);
            this.state.saveEvalForHash(elementHash, element.getAttribute(this.identifyKey));
            if (!this.view.evalFromView(this.state.getEvalForHash(elementHash))) {
                element.hidden = true;
            } else {
                element.hidden = false;
            }
            // this.view[element.getAttribute(this.identifyKey)].watch()
        } else {
            // element allready bound
        }

    }

    public updateIfElements() {


        for (let hash in this.state.getEvalForHashList()) {

            if (this.state.getEvalForHash(hash)) {

                const elList: HTMLElement[] =
                    Array.prototype.slice.call(this.view.element.querySelectorAll(`[${this.bindingKey}="${hash}"]`));

                // query selector all since we are using a hash mutliple times if possible!!
                elList.map(el => {
                    if (!this.view.evalFromView(this.state.getEvalForHash(hash))) {
                        el.hidden = true;
                    } else {
                        el.hidden = false;
                    }
                });

            }
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
}