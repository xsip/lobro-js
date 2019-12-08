import {EventListenerHook} from "./hooks/eventListenerHook";
// import {RequestHook} from "./hooks/requestHook";
import {PromiseHook} from "./hooks/promiseHook";
import {ControllerClass, ControllerOptions} from "./decorators/controller.decorator";
import {GeneralUtils} from "../shared/general.utils";
import {ContentBindings} from "./bindings/content.bindings";
import {IfBindings} from "./bindings/if.bindings";
import {InputBindings} from "./bindings/input.bindings";
import {ClickBinding} from "./bindings/click.binding";
import {DecoratedBinding, CBinding} from "./decorators/binding.decorator";
import {Compiler} from "./build/compiler";
import {Instanciator} from "./build/instanciator";
import {ForBindings} from "./bindings/for.bindings";


interface BasicControllerInstance<T = any> {
    updateTemplate: () => void;
    detectChanges: () => void;
    setBindings: (bindings: BasicControllerInstance<any>[]) => void;
    bindingInstances: { [index: string]: DecoratedBinding };
    element: HTMLElement;
}

// export type BasicControllerInstance<T = any> = BasicControllerInstance_ extends T;
interface ModuleConfig {
    controller: (typeof ControllerClass & any)[];
    bindings?: typeof DecoratedBinding[];
}

export class LoBroModule {

    public eventListenerHook: EventListenerHook;
    public promiseHook: PromiseHook;
    public controllerInstances: any[] = [];

    constructor(public config: ModuleConfig) {
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
            ForBindings
        ] as any;
    }

    public triggerAllChangeDetections() {
        console.log('triggering detectiion..');
        // this.config.controller.map((c: any) => c.detectChanges());
        this.controllerInstances.map((c: any) => c.renderer.detectChanges());
    }

    controllerBySelector: { [index: string]: typeof ControllerClass } = {};

    getControllerBySelector(selector: string): typeof ControllerClass {
        return this.controllerBySelector[selector];
    }

    controllerNameList: string[] = [];

    mapControllersToIndexList() {
        this.config.controller.map((c: typeof ControllerClass) => {
            this.controllerNameList.push((c as { options: ControllerOptions }).options.name);
            this.controllerBySelector[(c as { options: ControllerOptions }).options.name] = c;
        });
    }

    private initController(element: HTMLElement = document as any) {
        this.mapControllersToIndexList();
        let foundUnrenderedElements: boolean = false;
        const res = Array.prototype.slice.call(element.querySelectorAll(this.controllerNameList.join(',')));
        res.map(e => {
            const c = this.getControllerBySelector(e.nodeName.toLowerCase());

            if (c && !e.getAttribute('rendered')) {
                console.log(e.nodeName.toLowerCase(), e);
                e.setAttribute('rendered', 'true');
                e.id = GeneralUtils.createRandomHash(10);
                const instance: ControllerClass = new c(this.config.bindings);
                instance.renderTemplate(e);
                this.controllerInstances.push(instance);
                if (e.querySelectorAll(this.controllerNameList.join(','))) {
                    foundUnrenderedElements = true;
                }
            }

        })
        if (foundUnrenderedElements) {
            console.log('RE-INIT');
            this.initController(element);
        }
        /*this.config.controller.map((c: typeof ControllerClass) => {
            const res = Array.prototype.slice.call(document.querySelectorAll((c as { options: ControllerOptions }).options.name));
            res.map(e => {
                e.id = GeneralUtils.createRandomHash(10);
                const instance: ControllerClass = new c(this.config.bindings);
                instance.renderTemplate(e);
                this.controllerInstances.push(instance);
            });
        });*/
    }

    bootStrap() {

        this.eventListenerHook = new EventListenerHook();
        this.eventListenerHook.setModule(this);

        this.promiseHook = new PromiseHook();
        this.promiseHook.setModule(this);
        // this.compilerTest();

        this.initController();
        // this.compilerTest();
        // this.dumpPreCompiled();
    }

    compilerTest() {

        this.config.controller.map((c: typeof ControllerClass) => {

            const compiler: Compiler = new Compiler();

            const compilatiionResult = compiler.compile(c, this.config.bindings);
            // console.log(res.controllerName, res);
            const instanciator: Instanciator = new Instanciator();


            const elements = Array.prototype.slice.call(document.querySelectorAll((c.options.name)));
            elements.map(e => {
                e.id = GeneralUtils.createRandomHash(10);
                const instance = instanciator.compiledTemplateToInstance(compilatiionResult, c, this.config.bindings, e);
                console.log(compilatiionResult.controllerName, compilatiionResult);
                this.controllerInstances.push(instance);
            });
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
