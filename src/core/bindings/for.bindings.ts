import {View} from "./interfaces";
import {BindingState} from "../states/binding.state";
import {Binding, DecoratedBinding, CBinding, BindingOptions} from "../decorators/binding.decorator";
import {ContentBindings} from "./content.bindings";
import {GeneralUtils} from "../../shared/general.utils";
import {DomUtils} from "../../shared/dom.utils";

@Binding({
    selector: '[for]',
})
export class ForBindings implements CBinding {

    state: BindingState = new BindingState();
    bindingKey: string;
    selector: string;
    config: BindingOptions;
    contentBindings: ContentBindings;
    instance: ForBindings;

    constructor(public viewElement: HTMLElement, public view: View) {
        this.contentBindings = new ContentBindings(this.viewElement, this as any);
        this.instance = this;
    }

    lastUpdate(el: HTMLElement, hash: string, evalStr: string): void {

    }

    updateElement(el: HTMLElement, hash: string, evalStr: string): void {
        /*const forCpy = el.getAttribute('for');
        el.removeAttribute('for');
        this.contentBindings.reRenderElement(el, hash, evalStr);
        el.setAttribute('for', forCpy)*/
        el.parentNode.removeChild(el);
        // this.initBinding(el, hash, evalStr);
    }

    fixEval(evalStr: string, varName: string): string {
        this[varName] = this.view.evalFromView(evalStr.split('of ')[1]);
        evalStr = evalStr.replace('of', 'in');
        evalStr = evalStr.replace(evalStr.split('in ')[1], 'this.' + varName);
        return evalStr;
    }

    initBinding(templateChild: HTMLElement, hash: string, evalStr: string, setCstmData: boolean = true): void {
        this.initBindingProcedure(templateChild, hash, evalStr, setCstmData);
    }

    addForChildAttributeToEveryChild(root: HTMLElement) {
        for (let i = 0; i <= root.children.length; i++) {
            if (root.children[i]) {
                root.children[i].setAttribute('for-child', 'true');
                this.addForChildAttributeToEveryChild(root.children[i] as HTMLElement);
            }
        }
    }

    removeForChildAttributeToEveryChild(root: HTMLElement) {
        for (let i = 0; i <= root.children.length; i++) {
            if (root.children[i]) {
                root.children[i].removeAttribute('for-child');
                root.children[i].removeAttribute('for');
                this.removeForChildAttributeToEveryChild(root.children[i] as HTMLElement);
            }
        }
    }

    initBindingProcedure(templateChild: HTMLElement, hash: string, evalStr: string, setCstmData: boolean = true): void {
        this.state.setCustomDataForHash(hash, {original: templateChild, parent: templateChild.parentNode});
        // const nodeCpy = templateChild.cloneNode(true);
        const parent = templateChild.parentNode;

        parent.removeChild(templateChild);

        if (evalStr.indexOf(' in ') !== -1) {
            throw Error('[if] binding doesn\'t support element in at' + evalStr);
        } else if (evalStr.indexOf(' of ') === -1) {
            throw Error('[if] binding doesn\'t contain itteration' + evalStr);
        }

        let varName: string = '';

        try {
            varName = evalStr.match('let (.*?) of (.*?)')[1] + GeneralUtils.createRandomHash(4);
        } catch (e) {
            throw Error('Eval doens\'t contain for of at ' + evalStr);
        }
        evalStr = this.fixEval(evalStr, varName);
        const indexKey = evalStr.split(' in')[0].split(' ')[1];
        const completeEvalStr = `
        for(${evalStr}) {
            const cpy = templateChild.cloneNode(true);
            parent.append(cpy);
            const forCpy = cpy.getAttribute('for');
            cpy.removeAttribute('for');
            cpy.removeAttribute('for-child');
            cpy.innerHTML = cpy.innerHTML.replace(/${indexKey}\./g, 'this.${varName}[' + ${indexKey} + '].');
            this.removeForChildAttributeToEveryChild(cpy);
            this.contentBindings.initBinding(cpy);
            for( let i = 0; i <= cpy.children.length; i++){
                if(cpy.children[i]) {
                    this.contentBindings.initBinding(cpy.children[i], true);
                }
            }
            // this.addForChildAttributeToEveryChild(cpy);
            // cpy.setAttribute('for', forCpy);
            
            // cpy.removeAttribute('for-bind');
        }`;

        eval(completeEvalStr);
    }

    evalFromView = (evalStr: any) => {
        return this.view.evalFromView.bind({...this, ...this.view})(evalStr);
    };

    lastElementUpdated(): void {
        for (let hash in this.state.getEvalForHashList()) {
            const originalData: { original: HTMLElement; parent: HTMLElement; } = this.state.getCustomDataForHash(hash);
            originalData.parent.appendChild(originalData.original);
            originalData.original.setAttribute('for', this.state.getEvalForHash(hash));
            this.initBindingProcedure(originalData.original, hash, this.state.getEvalForHash(hash), false);
        }
    }
}