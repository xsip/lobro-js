import {EventListenerHook} from "./hooks/eventListenerHook";
// import {RequestHook} from "./hooks/requestHook";
import {PromiseHook} from "./hooks/promiseHook";
import {ControllerOptions} from "./base.controller";
import {GeneralUtils} from "../shared/general.utils";
import {BaseBinding} from "./bindings/base.binding";
import {ElementBindings} from "./bindings/element.bindings";
import {IfBindings} from "./bindings/if.bindings";
import {InputBindings} from "./bindings/input.bindings";


interface BasicControllerInstance<T = any> {
    updateTemplate: () => void;
    detectChanges: () => void;
    setBindings: (bindings: BasicControllerInstance<any>[]) => void;
}

// export type BasicControllerInstance<T = any> = BasicControllerInstance_ extends T;
interface ModuleConfig {
    controller: any[];
    bindings?: BaseBinding<any>[];
}

export class LoBroModule {

    public eventListenerHook: EventListenerHook;
    public promiseHook: PromiseHook;
    private controllerInstances: any[] = [];

    constructor(private config: ModuleConfig) {
        if (!config.bindings) {
            config.bindings = [];
        }
        config.bindings = [
            ...config.bindings,
            ElementBindings,
            IfBindings,
            InputBindings
        ] as any;
    }

    public triggerAllChangeDetections() {
        // this.config.controller.map((c: any) => c.detectChanges());
        this.controllerInstances.map((c: any) => c.detectChanges());
    }

    private initController() {
        this.config.controller.map(c => {
            const res = Array.prototype.slice.call(document.querySelectorAll((c as {options: ControllerOptions}).options.name));
            res.map(e => {
                e.id = GeneralUtils.createRandomHash(10);
                console.log('appending element');
                const instance: {config: ControllerOptions} = new c(e,this.config.bindings);
                this.controllerInstances.push(instance);
                // e.appendChild(elementToAppend.cloneNode(true));
            });
            /*
             const res = Array.prototype.slice.call(document.querySelectorAll(this.config.name.toUpperCase()));
                console.log(res);
                res.map(e => {
                    e.id = GeneralUtils.createRandomHash(10);
                    console.log('appending first element');
                    e.appendChild(elementToAppend.cloneNode(true));
                });
             */

        });
    }

    bootStrap() {

        this.eventListenerHook = new EventListenerHook();
        this.eventListenerHook.setModule(this);

        this.promiseHook = new PromiseHook();
        this.promiseHook.setModule(this);

        this.initController();
    }
}