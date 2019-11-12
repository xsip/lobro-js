import {Controller} from "../core/base.controller";


import './controller.scss';
import tmpl from './controller.html';
import * as path from "path";
// console.log(require('./controller.scss'));
@Controller({
    template: tmpl,
    name: 'controller',
    // stylesheet: 'src/controller/controller.scss',
})
export class MainController {
    version: any = 'version1';
    version2: any = 'version2';

    constructor() {
    }

    addEventListeners = () => {
        console.log('adding eventlisteners');
        document.getElementById('reloadSelected').addEventListener('click', () => {
            console.log('clicked!!');
            this.version = (document.getElementById('input') as HTMLInputElement).value;
            this.version2 = (document.getElementById('input2') as HTMLInputElement).value;
        });
        /*document.getElementById('input').addEventListener('input', (event: any) => {
            this.version = event[0].target.value;
            console.log(event[0].target.value);
            // this.version = (document.getElementById('input') as HTMLInputElement).value;
            // this.version2 = (document.getElementById('input2') as HTMLInputElement).value;
        });*/
    };

    afterRender = () => {
        console.log('after render called');
        this.addEventListeners();
    };


}
