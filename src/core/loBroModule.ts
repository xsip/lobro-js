import {EventListenerHook} from "./hooks/eventListenerHook";
// import {RequestHook} from "./hooks/requestHook";
import {PromiseHook} from "./hooks/promiseHook";


interface BasicControllerInstance<T = any> {
    updateTemplate: () => void;
    detectChanges: () => void;
}

// export type BasicControllerInstance<T = any> = BasicControllerInstance_ extends T;
interface ModuleConfig {
    controller: any[];
}

export class LoBroModule {

    public eventListenerHook: EventListenerHook;
    public promiseHook: PromiseHook;
    private controllerInstances: any[] = [];

    constructor(private config: ModuleConfig) {

    }

    triggerAllChangeDetections() {
        // this.config.controller.map((c: any) => c.detectChanges());
        this.controllerInstances.map((c: any) => c.detectChanges());
    }

    private initController() {
        this.config.controller.map(c => {
            this.controllerInstances.push(new c());
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