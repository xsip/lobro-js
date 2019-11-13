import {State} from "../state";
import {View} from "./interfaces";
type _any = any;
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

// export type BaseBinding<T = any> = _BaseBinding & T;