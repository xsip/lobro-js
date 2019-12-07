import {View} from "../bindings/interfaces";
import {BindingState} from "../states/binding.state";
import {GeneralUtils} from "../../shared/general.utils";

export interface BindingOptions {
    selector: string;
}

export type Constructor<T = {}> = new(...args: any[]) => T;


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

    public lastElementUpdated(): void {
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
                return element.getAttribute(this.fixedSelector + '-bind') ? true : false;
            }

            initBinding(templateChild: HTMLElement): void {
                if (!this.hasBinding(templateChild)) {
                    if (templateChild.matches(this.selector)) {
                        const elementHash: string = GeneralUtils.createRandomHash(5);
                        templateChild.setAttribute(this.bindingKey, elementHash);
                        this.state.saveEvalForHash(elementHash, templateChild.getAttribute(this.fixedSelector));
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
                        elList.map((el: HTMLElement, index: number) => {
                            super.updateElement(el, hash, evalStr);
                            if (index === elList.length - 1) {
                                if (super.lastElementUpdated) {
                                    super.lastElementUpdated();
                                }

                            }
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