import {GeneralUtils} from "../../shared/general.utils";
import {View} from "./interfaces";
import {BindingState} from "../states/binding.state";
import {Binding, CBinding, BindingOptions} from "../decorators/binding.decorator";

@Binding({
    selector: '[click]',
})
export class ClickBinding implements CBinding {
    state: BindingState = new BindingState();
    config: BindingOptions;
    bodyClickListenerAdded = false;

    constructor(public viewElement: HTMLElement, public view: View) {

    }

    async bodyClickListener(event: Event) {

        if ((event.target as HTMLElement).getAttribute('click-bind')) {
            const hash = (event.target as HTMLElement).getAttribute('click-bind');
            let params = GeneralUtils.extractFunctionParams(this.state.getEvalForHash(hash));
            const functionName = GeneralUtils.extractFunctionName(this.state.getEvalForHash(hash));


            params = params.map(param => {
                if (param.indexOf('$event') !== -1) {
                    return param.replace('$', '');
                }
                return param;
            });
            let rebuildFunction: string = functionName + '(' + params.join(',') + ')';
            console.log(rebuildFunction);
            await this.view.evalFromView(rebuildFunction);
        }
    }

    // TODO: instead of adding click event listeners to every element, add one Globally,
    // TODO: and templateChild always to a list of this bindingclass.
    // TODO: Try to match event.target with one of the lists elements. 
    // TODO: If there is a match, trigger it's eval resolved by its hash.
    public initBinding(templateChild: HTMLElement, hash: string, evalSt: string) {

        if (!this.bodyClickListenerAdded) {
            this.bodyClickListenerAdded = true;
            document.body.addEventListener('click', this.bodyClickListener.bind(this));
        }

        /*templateChild.addEventListener('click', async () => {
            // added await for try catch block!!
            await this.view.evalFromView(this.state.getEvalForHash(hash));
        });*/
        // console.log((templateChild as any).getEventListeners('click')[0].listener.toString());

    }

    selector: string;
    bindingKey: string;

    updateElement(templateChild: HTMLElement, hash: string, evalStr: string): void {
        // no update needed..
    }

    lastElementUpdated(): void {
    }
}
