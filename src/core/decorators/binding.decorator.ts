import {ControllerOptions} from "./controller.decorator";
import {View} from "../bindings/interfaces";
import {BindingState} from "../states/binding.state";
import {GeneralUtils} from "../../shared/general.utils";

export interface BindingOptions {
    selector: string;
}

export type Constructor<T = {}> = new(...args: any[]) => T;

interface ExtendedElement extends HTMLElement {
    getEventListeners: () => { [index: string]: any[] }
}

export interface DecoratedBindingByIndex {
    [index: string]: DecoratedBinding
};

export abstract class DecoratedBinding {
    view: View;
    viewElement: HTMLElement;
    state: BindingState;
    selector: string;
    bindingKey: string;
    name: string;
    static bindingName: string;

    public initBinding(templateChild: HTMLElement): void {
    };

    public updateSchedule(): void {
    };

    public reduceMappings(): void {
    };

    protected constructor(viewElement: HTMLElement, view: View) {
    }

}

export abstract class CBinding {
    view: View;
    viewElement: HTMLElement;
    state: BindingState;
    selector: string;
    // bindingKey: string;
    bindingKey?: string;
    config: BindingOptions;


    public initBinding(templateChild: HTMLElement, hash?: string, evalStr?: string): void {
    };

    /*public updateSchedule(): void {
    };

    public reduceMappings(): void {
    };*/

    protected constructor(viewElement: HTMLElement, view: View) {
    }

    public updateElement(templateChild: HTMLElement, hash?: string, evalStr?: string): void {
    };
}

export const Binding = (options: BindingOptions): any => {
    // return (target) => {
    return <TClass extends new (...args: any[]) => CBinding>(target: TClass): any => {
        Object.assign(target.prototype, {
            config: options,
        });


        class BindingDec extends target implements DecoratedBinding {
            view: View;
            viewElement: HTMLElement;
            state: BindingState;
            config: BindingOptions;
            fixedSelector: string;
            bidingKey: string;
            name: string;
            public static bindingName: string;

            constructor(...args: any[]) {
                super(...args);
                this.selector = this.config.selector;
                this.fixedSelector = this.selector.replace(/[^\w\s]/gi, '');
                this.name = this.fixedSelector;
                this.bindingKey = this.fixedSelector + '-bind';
                BindingDec.bindingName = this.fixedSelector;

            }

            hasBinding(element: HTMLElement) {
                /*if (this.config.isSelectorBinding) {
                    return element.nodeName.toLowerCase() === this.config.propKey;
                }*/
                return element.getAttribute(this.fixedSelector + '-bind');
            }

            initBinding(templateChild: HTMLElement): void {
                if (!this.hasBinding(templateChild)) {
                    // if (templateChild.getAttribute(this.propKey)) {
                    // console.log(templateChild.matches(this.selector));
                    if (templateChild.matches(this.selector)) {
                        // console.log(templateChild.matches(this.selector));
                        const elementHash: string = GeneralUtils.createRandomHash(5);
                        templateChild.setAttribute(this.bindingKey, elementHash);
                        // console.log('setting ' + this.bindingKey + ' to ', elementHash);
                        this.state.saveEvalForHash(elementHash, templateChild.getAttribute(this.fixedSelector));
                        // console.log(templateChild.getAttribute(this.selector));
                        // console.log(this.state.getEvalForHashList());
                        super.initBinding(templateChild, elementHash, this.state.getEvalForHash(elementHash));
                        // TODO: remove on error ases with other bindings!!
                        templateChild.removeAttribute(this.fixedSelector);
                    }
                }


            }

            reduceMappings(): void {
                this.state.reduceMappings(this.replaceHashInDom);
            }

            replaceHashInDom = (hash: string, newHash: string) => {
                const el = this.view.element.querySelector(`[${this.bindingKey}~="${hash}"]`);
                const hashList = el.getAttribute(this.bindingKey);
                el.setAttribute(this.bindingKey, hashList.replace(hash, newHash));
            };

            updateSchedule(): void {
                for (let hash in this.state.getEvalForHashList()) {
                    const evalStr = this.state.getEvalForHash(hash);
                    if (evalStr) {

                        const elList: HTMLElement[] =
                            Array.prototype.slice.call(this.view.element.querySelectorAll(`[${this.fixedSelector}-bind="${hash}"]`));

                        // query selector all since we are using a hash mutliple times if possible!!
                        elList.map(el => {
                            super.updateElement(el, hash, evalStr);
                        });

                    }
                }

            }

            bindingKey: string;
            selector: string;

        }

        return BindingDec;
    }
};