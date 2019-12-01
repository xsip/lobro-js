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
    versions: any = {
        version: 1,
        version2: 2,
    };
    demoJson = demoJson;

    constructor() {
        // console.log('MAIN CONTROLLER INIT');
    }

    plusOne = (value: number) => value + 1;
    versionPlusVersion = (v1: number, v2: number) => v1 + v2;

    async buttonClick() {
        console.log('BUTTON CLICK FUNC!!');
        this.showElement = !this.showElement;
        try {
            const res: any = await fetch('https://jsonplaceholder.typicode.com/todos');
            const data: any = await res.json();
            this.demoJson = data;
            console.log(data);
            this.version = data[5].id;
            this.version2 = data[10].id;
        } catch (e) {
            this.version = -1;
            this.version = -2;
        }
    }


    afterRender = () => {
        console.log('after render called');
        // this.addEventListeners();
        // this.buttonClick();
    };


}
