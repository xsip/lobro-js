import {EventListenerHook} from "./eventListenerHook";


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
    private controllerInstances: any[] = [];

    constructor(private config: ModuleConfig) {

    }

    triggerAllChangeDetections() {
        // this.config.controller.map((c: any) => c.detectChanges());
        this.controllerInstances.map((c: any) => c.detectChanges());
    }

    private initModules() {
        this.config.controller.map(c => {
            console.log('INIT CONTROLLERS!!');
            this.controllerInstances.push(new c());
        });
    }

    bootStrap() {
        this.eventListenerHook = new EventListenerHook();
        this.eventListenerHook.setModule(this);
        this.initModules();
    }
}