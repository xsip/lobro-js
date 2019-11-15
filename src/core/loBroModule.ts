import {EventListenerHook} from "./hooks/eventListenerHook";
// import {RequestHook} from "./hooks/requestHook";
import {PromiseHook} from "./hooks/promiseHook";
import {ControllerOptions} from "./decorators/controller.decorator";
import {GeneralUtils} from "../shared/general.utils";
import {ContentBindings} from "./bindings/content.bindings";
import {IfBindings} from "./bindings/if.bindings";
import {InputBindings} from "./bindings/input.bindings";
import {ClickBinding} from "./bindings/click.binding";
import {DecoratedBinding, CBinding} from "./decorators/binding.decorator";
import {Compiler} from "./build/compiler";


interface BasicControllerInstance<T = any> {
    updateTemplate: () => void;
    detectChanges: () => void;
    setBindings: (bindings: BasicControllerInstance<any>[]) => void;
    bindingInstances: { [index: string]: DecoratedBinding };
    element: HTMLElement;
}

// export type BasicControllerInstance<T = any> = BasicControllerInstance_ extends T;
interface ModuleConfig {
    controller: any[];
    bindings?: DecoratedBinding[];
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
            // basic bindings, needed to make lobro-js Work
            ContentBindings,
            IfBindings,
            InputBindings,
            ClickBinding,
        ] as any;
    }

    public triggerAllChangeDetections() {
        // this.config.controller.map((c: any) => c.detectChanges());
        this.controllerInstances.map((c: any) => c.detectChanges());
    }

    private initController() {
        this.config.controller.map(c => {
            const res = Array.prototype.slice.call(document.querySelectorAll((c as { options: ControllerOptions }).options.name));
            res.map(e => {
                e.id = GeneralUtils.createRandomHash(10);
                const instance: { config: ControllerOptions } = new c(e, this.config.bindings);
                this.controllerInstances.push(instance);
            });
        });
    }

    bootStrap() {

        this.eventListenerHook = new EventListenerHook();
        this.eventListenerHook.setModule(this);

        this.promiseHook = new PromiseHook();
        this.promiseHook.setModule(this);
        this.compilerTest();
        this.initController();
        // this.dumpPreCompiled();
    }

    compilerTest() {

        this.config.controller.map(c => {

            const compiler: Compiler = new Compiler(c.options.template, this.config.bindings);
            const res = compiler.compile();
            window['bds'] = res.bindingStates;
            window['oht'] = res.element.outerHTML;
        })

    }

    dumpPreCompiled() {
        console.log('DUMPING');
        this.controllerInstances.map((c: BasicControllerInstance<any>) => {
            //console.log(c.bindingInstances);
            // console.log(c.element.outerHTML);
        });
    }
}