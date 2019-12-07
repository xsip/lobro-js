import {CompiledTemplate} from "./compiler";
import {ControllerClass} from "../decorators/controller.decorator";
import {DecoratedBinding} from "../decorators/binding.decorator";

export class Instanciator {
    constructor() {

    }

    compiledTemplateToInstance(compiledTemplate: CompiledTemplate, controller: typeof ControllerClass, bindings: typeof DecoratedBinding[], appendTo: HTMLElement): ControllerClass {
        let instance: ControllerClass;
        if (compiledTemplate.controllerName === controller.options.name) {
            controller.options.template = compiledTemplate.template;
            instance = new controller(bindings);
            instance.createInstance(compiledTemplate, appendTo);
            // instance.createInstance(compiledTemplate, appendTo);
        }

        return instance;

    }
}