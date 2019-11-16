import tmpl from './header-controller.html';
import './header-controller.scss';
import * as path from "path";
import {Controller} from "../../decorators/controller.decorator";

@Controller({
    template: tmpl,
    name: 'header-controller',
    stylesheet: 'header-controller/header-controller.scss',
})
export class HeaderController {
    version: any = 1;
    version2: any = 2;
    showElement = true;
    versions: any = {
        version: 1,
        version2: 2,
    };

    constructor() {
        // console.log('MAIN CONTROLLER INIT');
    }

    async buttonClick() {
        console.log('BUTTON CLICK FUNC!!');
        this.showElement = !this.showElement;
        try {
            const res: any = await fetch('https://jsonplaceholder.typicode.com/todos');
            const data: any = await res.json();
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
