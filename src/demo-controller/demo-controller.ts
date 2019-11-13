import {Controller} from "../core/base.controller";

import tmpl from './demo-controller.html';
import * as path from "path";

require('demo-controller/demo-controller.scss');

@Controller({
    template: tmpl,
    name: 'controller',
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

    constructor() {
        // console.log('MAIN CONTROLLER INIT');
    }

    async buttonClick() {
        console.log('BUTTON CLICK FUNC!!');
        this.showElement = !this.showElement;
        const res: any = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data: any = await res.json();
        console.log(data);
        this.version = data[5].id;
        this.version2 = data[10].id;
        /*fetch('https://jsonplaceholder.typicode.com/todos')
            .then(response => response.json())
            .then(data => {
                // console.log(JSON.stringify(data));
                // TODO: add click bindings for buttons i.e!!
                // TODO: fix change detction for nested objects
                console.log('CONTROLLER GOT DATA');
                this.version = data[5].id;
                this.version2 = data[10].id;
            });*/
    }

    addEventListeners = () => {
        // console.log('adding eventlisteners');
        /*document.getElementById('reloadSelected').addEventListener('click', () => {
            console.log('clicked!!');
            this.showElement = !this.showElement;
            fetch('https://jsonplaceholder.typicode.com/todos')
                .then(response => response.json())
                .then(data => {
                    // console.log(JSON.stringify(data));
                    // TODO: add click bindings for buttons i.e!!
                    // TODO: fix change detction for nested objects
                    console.log('CONTROLLER GOT DATA');
                    this.version = data[5].id;
                    this.version2 = data[10].id;
                });
            // this.version++; //  = (document.getElementById('input') as HTMLInputElement).value;
            // this.version2++; //  = (document.getElementById('input2') as HTMLInputElement).value;
        });*/
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
