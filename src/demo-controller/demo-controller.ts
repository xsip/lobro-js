import {Controller} from "../core/base.controller";


import './demo-controller.scss';
import tmpl from './demo-controller.html';
import * as path from "path";

// console.log(require('./controller.scss'));
@Controller({
    template: tmpl,
    name: 'controller',
    // stylesheet: 'src/controller/controller.scss',
})
export class DemoController {
    version: any = 1;
    version2: any = 2;
    versions: any = {
        version: 1,
        version2: 2,
    };

    constructor() {
        // console.log('MAIN CONTROLLER INIT');
    }

    addEventListeners = () => {
        // console.log('adding eventlisteners');
        document.getElementById('reloadSelected').addEventListener('click', () => {
            console.log('clicked!!');
            fetch('https://jsonplaceholder.typicode.com/todos')
                .then(response => response.json())
                .then(data => {
                    // console.log(JSON.stringify(data));
                    // TODO: fix change detction for nested objects
                    console.log('CONTROLLER GOT DATA');
                    this.versions.version = data[5].id;
                    this.versions.version2 = data[10].id;
                });
            // this.version++; //  = (document.getElementById('input') as HTMLInputElement).value;
            // this.version2++; //  = (document.getElementById('input2') as HTMLInputElement).value;
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
