import {Controller} from "../core/base.controller";


import './controller.scss';
import tmpl from './controller.html';

@Controller({
    template: tmpl,
    name: 'controller'
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
            // this.version++;
            this['detectChanges']();
        });
    };

    afterRender = () => {
        console.log('after render called');
        this.addEventListeners();
    };


}
