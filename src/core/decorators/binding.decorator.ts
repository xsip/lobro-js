import {ControllerOptions} from "./base.controller";
import {View} from "../bindings/interfaces";
import {State} from "../state";

export interface BindingOptions {
    propKey: string;
    passMatchingElementsOnly?: boolean;
}

type Constructor<T = {}> = new(...args: any[]) => T;

interface ExtendedElement extends HTMLElement {
    getEventListeners: () => { [index: string]: any[] }
}

/*
export interface BaseBinding<T = any> extends _any {
    // new(viewElement: HTMLElement, view: View): T;

    state: State;
    initBinding: (templateChild: HTMLElement) => void;
    updateSchedule: () => void;
    reduceMappings: () => void;
    bindingKey: string;
    identifyKey?: string;
    // viewElement?: HTMLElement,
    // view?: View;
    // constructor: (viewElement: HTMLElement, view: View) => any;
    // view: View;
    // viewElement: HTMLElement;
}
 */

export abstract class BindingClass {
    view: View;
    viewElement: HTMLElement;
    state: State;
    propKey: string;

    public initBinding(templateChild: HTMLElement): void {
    };

    public updateSchedule(): void {
    };

    public reduceMappings(): void {
    };

    protected constructor(viewElement: HTMLElement, view: View) {
    }

}

export abstract class BindingClassPublic {
    view: View;
    viewElement: HTMLElement;
    state: State;
    propKey: string;

    public initBinding(templateChild: HTMLElement): void {
    };

    /*public updateSchedule(): void {
    };*/

    public reduceMappings(): void {
    };

    protected constructor(viewElement: HTMLElement, view: View) {
    }

    public updateElement(templateChild: HTMLElement, hash: string, evalStr: string): void {
    };
}

export const Binding = (options: BindingOptions): any => {
    // return (target) => {
    return <TClass extends new (...args: any[]) => BindingClassPublic>(target: TClass): any => {
        Object.assign(target.prototype, {
            config: options,
        });


        class BindingDec extends target implements BindingClass {
            view: View;
            viewElement: HTMLElement;
            state: State;
            config: BindingOptions;

            constructor(...args: any[]) {
                super(...args);

            }

            hasBinding(element: HTMLElement) {
                return element.getAttribute(this.config.propKey + '-bind');
            }

            initBinding(templateChild: HTMLElement): void {
                if (!this.hasBinding(templateChild)) {
                    if (this.config.passMatchingElementsOnly && (templateChild.hasAttribute(this.config.propKey))) {
                        super.initBinding(templateChild);
                    } else if (!this.config.passMatchingElementsOnly) {
                        super.initBinding(templateChild);
                    }
                }

            }

            reduceMappings(): void {
                super.reduceMappings();
            }

            updateSchedule(): void {
                for (let hash in this.state.getEvalForHashList()) {
                    const evalStr = this.state.getEvalForHash(hash);
                    if (evalStr) {

                        const elList: HTMLElement[] =
                            Array.prototype.slice.call(this.view.element.querySelectorAll(`[${this.config.propKey}-bind="${hash}"]`));

                        // query selector all since we are using a hash mutliple times if possible!!
                        elList.map(el => {
                            super.updateElement(el, hash, evalStr);
                        });

                    }
                }

            }

        }

        return BindingDec;
    }
};