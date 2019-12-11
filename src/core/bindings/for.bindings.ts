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
        console.log(hash, this.state.getEvalForHash(hash));
        el.parentNode.removeChild(el);
        // this.initBinding(el, hash, evalStr);
    }

    fixEval(evalStr: string, varName: string, loopType: 'of' | 'in' = 'of'): string {
        evalStr = evalStr.replace('of', 'in');
        evalStr = evalStr.replace(evalStr.split('in ')[1], 'this.view.' + varName);
        return evalStr;
    }

    currentControllerHash: string;

    initBinding(templateChild: HTMLElement, hash: string, evalStr: string, controllerHash?: string): void {
        this.currentControllerHash = controllerHash;
        this.initBindingProcedure(templateChild, hash, evalStr, true);
    }

    addForChildAttributeToEveryChild(root: HTMLElement) {
        for (let i = 0; i <= root.children.length; i++) {
            if (root.children[i]) {
                root.children[i].setAttribute('for-child', 'true');
                this.addForChildAttributeToEveryChild(root.children[i] as HTMLElement);
            }
        }
    }

    removeForChildAttributeToEveryChild = (root: HTMLElement) => {
        for (let i = 0; i <= root.children.length; i++) {
            if (root.children[i]) {
                root.children[i].removeAttribute('for-child');
                root.children[i].removeAttribute('for');
                this.removeForChildAttributeToEveryChild(root.children[i] as HTMLElement);
            }
        }
    }

    fixAlLAttributes = (elem: HTMLElement, itteratorVarName: string, value: string) => {
        for (var i = 0; i < elem.attributes.length; i++) {
            var attrib = elem.attributes[i];
            // console.log(attrib.name + " = " + attrib.value);
            if (attrib.value.indexOf(itteratorVarName) !== -1) {
                console.log('Fixed', attrib.name);
                elem.setAttribute(attrib.name, value.replace(/{/g, '').replace(/}/g, ''));
            }
        }
    }

    instanciateChild = (templateChild: HTMLElement) => {
        this.view.renderer.instanciateChild(templateChild, () => {
            this.view.renderer.setControllerHash(templateChild, this.currentControllerHash);
        });
    }
    currentTemplateChild: HTMLElement;
    currentHash: string;
    currentEvalStr: string;
    currentI: number = 0;

    initBindingForIn(templateChild: HTMLElement, hash: string, evalStr: string, setCstmData: boolean = true, parent: HTMLElement): void {

        let varName: string = '';
        try {
            varName = evalStr.match('let (.*?) in (.*?)')[1] + GeneralUtils.createRandomHash(4);
        } catch (e) {
            throw Error('Eval doens\'t contain for in at ' + evalStr);
        }
        this.view[varName] = this.view.evalFromView(this.currentEvalStr.split('in')[1]);
        evalStr = this.fixEval(evalStr, varName);
        const indexKey = evalStr.split(' in')[0].split(' ')[1];
        this.currentI = 0;
        const completeEvalStr = `
        for(${evalStr}) {
            const cpy = this.currentTemplateChild.cloneNode(true);
            this.currentTemplateChild.parentNode.insertBefore(cpy, this.currentTemplateChild);
            cpy.hidden = false;
            const forCpy = cpy.getAttribute('for');
            cpy.removeAttribute('for');
            cpy.removeAttribute('for-child');
            cpy.innerHTML = cpy.innerHTML.replace(/${indexKey}\./g, 'this.${varName}[' + this.currentI + ']}');
            
            this.removeForChildAttributeToEveryChild(cpy);
            // this.contentBindings.initBinding(cpy);
            
            for( let i = 0; i <= cpy.children.length; i++){
                if(cpy.children[i]) {
                this.fixAlLAttributes(cpy.children[i], ${indexKey},'this.${varName}[' + this.currentI + ']}');
                    this.instanciateChild(cpy.children[i]);
                    // this.contentBindings.initBinding(cpy.children[i]);
                }
            }
            this.currentI++;
        }`;
        this.evalFromView(completeEvalStr);
    }


    initBindingForOf(templateChild: HTMLElement, hash: string, evalStr: string, setCstmData: boolean = true, parent: HTMLElement): void {
        let varName: string = '';

        try {
            varName = evalStr.match('let (.*?) of (.*?)')[1] + GeneralUtils.createRandomHash(4);
        } catch (e) {
            throw Error('Eval doens\'t contain for of at ' + evalStr);
        }
        this.view[varName] = this.view.evalFromView(evalStr.split('of')[1]);
        evalStr = this.fixEval(evalStr, varName);
        const indexKey = evalStr.split(' in')[0].split(' ')[1];
        const completeEvalStr = `
        for(${evalStr}) {
            const cpy = templateChild.cloneNode(true);
            parent.parentNode.insertBefore(cpy, parent);
            cpy.hidden = false;
            const forCpy = cpy.getAttribute('for');
            cpy.removeAttribute('for');
            cpy.removeAttribute('for-child');
            cpy.innerHTML = cpy.innerHTML.replace(/${indexKey}\./g, 'this.${varName}[' + ${indexKey} + '].');
            this.removeForChildAttributeToEveryChild(cpy);
            // this.contentBindings.initBinding(cpy);
            for( let i = 0; i <= cpy.children.length; i++){
                if(cpy.children[i]) {
                    this.instanciateChild(cpy.children[i]);
                    // this.contentBindings.initBinding(cpy.children[i]);
                }
            }
        }`;

        this.evalFromView(completeEvalStr);
    }

    initBindingProcedure(templateChild: HTMLElement, hash: string, evalStr: string, setCstmData: boolean = true): void {
        if (setCstmData) {
            this.state.setCustomDataForHash(hash, {original: templateChild, parent: templateChild.parentNode});
        }
        // const nodeCpy = templateChild.cloneNode(true);
        const parent = templateChild; // .parentNode;
        templateChild.hidden = true;
        // parent.removeChild(templateChild);
        this.currentTemplateChild = templateChild;
        this.currentHash = hash;
        this.currentEvalStr = evalStr;
        if (evalStr.indexOf(' in ') !== -1) {
            // throw Error('[if] binding doesn\'t support element in at' + evalStr);
            // new
            this.initBindingForIn(templateChild, hash, evalStr, setCstmData, parent as HTMLElement);

        } else if (evalStr.indexOf(' of ') !== -1) {
            this.initBindingForOf(templateChild, hash, evalStr, setCstmData, parent as HTMLElement);
            // throw Error('[if] binding doesn\'t contain itteration' + evalStr);
        }
    }

    evalFromView = (evalStr: string) => {
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