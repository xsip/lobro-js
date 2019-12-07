import 'reflect-metadata'
import {DomUtils} from "../../shared/dom.utils";
import {BindingState} from "../states/binding.state";
import {CBinding, DecoratedBinding} from "./binding.decorator";
import {ControllerState} from "../states/controller.state";
import {CompiledTemplate} from "../build/compiler";
import {Renderer} from "../rendering/renderer";

export interface ControllerOptions {
    template: string;
    name: string;
    stylesheet?: string;
}

export const CONTROLLER_DECORATOR_KEY = 'ControllerData';

const newState = (): BindingState => new BindingState();

type Constructor<T = {}> = new(...args: any[]) => T;

export class ControllerClass {
    public static options: ControllerOptions;

    private renderInElement: HTMLElement;
    // private bindings: DecoratedBinding[];
    private state: ControllerState;
    public element: HTMLElement;

    constructor(bindings: typeof DecoratedBinding[]) {

    }

    public evalFromView(evalData: string) {
    };


    public renderTemplate(appendTo: HTMLElement) {
    };

    public updateTemplate() {
    }

}

export class UpdateScheduler {
    updateScheduler;

    start(todo: () => void) {
        this.updateScheduler = setInterval(() => {
            todo();
        }, this.updateInterval);
    }

    constructor(private updateInterval: number = 10000) {

    }

}

export const Controller = (options: ControllerOptions): any => {

    return <TClass extends new (...args: any[]) => ControllerClass>(target: TClass): any => {
        class Controller extends target implements ControllerClass {

            public static options: ControllerOptions = options;
            element: HTMLElement;
            renderer: Renderer;
            t: any = target;
            public static template: string = options.template;
            bindings: typeof DecoratedBinding[] = [];

            constructor(...args: any[]) {
                super();
                this.bindings = args[0];
                this.renderer = new Renderer(this as any, this.bindings, options);
            }


            evalFromView(evalData: string) {
                try {
                    return eval(evalData);
                } catch (e) {
                    console.error(e);
                    return evalData;
                }

            }

            renderTemplate(appendTo: HTMLElement) {
                this.element = this.renderer.createElement();
                this.renderer.renderTemplate(appendTo);
            }

            updateTemplate() {
                this.renderer.updateTemplate();
            }

        }

        return Controller;
    }
};


