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
    todoItems: { name: string }[] = [{name: 'test'}];
    todoItems2: string[] = ['test'];
    inputValue: string = '';

    constructor() {
        // console.log('MAIN CONTROLLER INIT');
    }

    plusOne = (value: number) => value + 1;
    versionPlusVersion = (v1: number, v2: number) => v1 + v2;

    async addItem(event: Event) {
        this.todoItems.push({name: this.inputValue});
        this.todoItems2.push(this.inputValue);
        this.inputValue = '';
    }


    afterRender = () => {
        console.log('after render called');
        // this.buttonClick();
    };


}
