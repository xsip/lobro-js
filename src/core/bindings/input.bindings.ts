import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {State} from "../state";
import {ExtendedElement} from "../../shared/dom.utils";
import {BaseBinding} from "./base.binding";


export class InputBindings implements BaseBinding<InputBindings> {
    state: State = new State();
    bindingKey: string = 'input-bind';
    identifyKey: string = 'bind';

    constructor(private viewElement: HTMLElement, private view: View) {

    }

    public initBinding(templateChild: HTMLElement) {

        if (templateChild.hasAttribute(this.identifyKey)) {
            // console.log('adding binding for ', templateChild.id);
            this.handleBinding(templateChild);
        } else if (templateChild.nodeName.toLowerCase() === 'input') {
            this.emptyInputHookForChangeDetectionTrigger(templateChild);
        }
    }

    private handleBinding(element: HTMLElement) {

        if (!element.getAttribute(this.bindingKey)) {
            const elementHash: string = GeneralUtils.createRandomHash(5);

            (element as HTMLInputElement).value = this.view.evalFromView(element.getAttribute(this.identifyKey));
            element.setAttribute(this.bindingKey, elementHash);
            // this.evalForHash[elementHash] = element.getAttribute('bind');
            this.state.saveEvalForHash(elementHash, element.getAttribute(this.identifyKey));
            element.addEventListener('input', (/*event: any*/) => {
                this.view.evalFromView(element.getAttribute(this.identifyKey) + ' = event.target.value;');
                // this.updateTemplate();
                // this.version = (document.getElementById('input') as HTMLInputElement).value;
                // this.version2 = (document.getElementById('input2') as HTMLInputElement).value;
            });
        } else {
            // element allready bound
        }

    }

    private emptyInputHookForChangeDetectionTrigger(element: HTMLElement) {
        // TODO: add check if there allready is any input listener!!
        if (!element.getAttribute(this.bindingKey)) {
            element.addEventListener('input', (/*event: any*/) => {
                // only for change detection
            });
        }
    }

    private reavalInputValue(templateChild: HTMLInputElement, hash: string) {
        if (hash) {
            (templateChild as HTMLInputElement).value = this.view.evalFromView(this.state.getEvalForHash(hash));
        }
    }

    public updateSchedule() {


        for (let hash in this.state.getEvalForHashList()) {

            if (this.state.getEvalForHash(hash)) {

                const elList: HTMLElement[] =
                    Array.prototype.slice.call(this.view.element.querySelectorAll(`[${this.bindingKey}="${hash}"]`));

                // query selector all since we are using a hash mutliple times if possible!!
                elList.map(el => {
                    this.reavalInputValue(el as HTMLInputElement, hash);
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