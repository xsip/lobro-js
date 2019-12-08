import tmpl from './demo-controller.html';
import './demo-controller.scss';
import * as path from "path";
import {Controller} from "../../decorators/controller.decorator";
import {demoJson} from "./demojson";

@Controller({
    template: tmpl,
    name: 'demo-controller',
    stylesheet: 'demo-controller/demo-controller.scss',
})
export class DemoController {
    version: any = 1;
    version2: any = 2;
    showElement = true;
    versions: { version: number; version2: number; } = {
        version: 1,
        version2: 2,
    };
    demoJson: {} = demoJson;

    constructor() {
        // console.log('MAIN CONTROLLER INIT');
    }

    plusOne = (value: number) => value + 1;
    versionPlusVersion = (v1: number, v2: number) => v1 + v2;

    async addItem(event: Event) {
        console.log('BUTTON CLICK FUNC!!');
        console.log(event);
    }


    afterRender = () => {
        console.log('after render called');
        // this.buttonClick();
    };


}
