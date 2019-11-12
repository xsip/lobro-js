import {GeneralUtils} from "../../shared/general.utils";

interface View {
    evalFromView: (evalData: any) => any;
    element: HTMLElement;
}


export class InputBindings<T = any> {
    evalForHash: any = {};
    bindHashKey: string = 'bind-hash';

    constructor(private viewElement: HTMLElement, private view: View) {

    }

    public initInputBindingsIfInputElement(templateChild: HTMLElement) {

        if (templateChild.hasAttribute('bind')) {
            // console.log('adding binding for ', templateChild.id);
            this.handleBinding(templateChild);
        } else if (templateChild.nodeName.toLowerCase() === 'input') {
            this.emptyInputHookForChangeDetectionTrigger(templateChild);
        }
    }

    private handleBinding(element: HTMLElement) {

        if (!element.getAttribute('bind-hash')) {
            const elementHash: string = GeneralUtils.createRandomHash(5);

            (element as HTMLInputElement).value = this.view.evalFromView(element.getAttribute('bind'));
            element.setAttribute(this.bindHashKey, elementHash);
            this.evalForHash[elementHash] = element.getAttribute('bind');

            element.addEventListener('input', (/*event: any*/) => {
                this.view.evalFromView(element.getAttribute('bind') + ' = event.target.value;');
                // this.updateTemplate();
                // this.version = (document.getElementById('input') as HTMLInputElement).value;
                // this.version2 = (document.getElementById('input2') as HTMLInputElement).value;
            });
        } else {
            // element allready bound
        }

    }

    private emptyInputHookForChangeDetectionTrigger(element: HTMLElement) {
        if (!element.getAttribute(this.bindHashKey)) {
            element.addEventListener('input', (/*event: any*/) => {
                // only for change detection
            });
        }
    }

    private reavalInputValue(templateChild: HTMLInputElement, hash: string) {
        if (hash) {
            (templateChild as HTMLInputElement).value = this.view.evalFromView(this.evalForHash[hash]);
        }
    }

    public updateInputs() {


        for (let hash in this.evalForHash) {

            if (this.evalForHash[hash]) {

                const elList: HTMLElement[] =
                    Array.prototype.slice.call(this.view.element.querySelectorAll(`[${this.bindHashKey}="${hash}"]`));

                // query selector all since we are using a hash mutliple times if possible!!
                elList.map(el => {
                    this.reavalInputValue(el as HTMLInputElement, hash);
                });

            }
        }
    }

}