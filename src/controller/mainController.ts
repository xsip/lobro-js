import {Controller2} from "../core/base.controller";


import './controller.scss';
import tmpl from './controller.html';

@Controller2({
    template: tmpl,
    name: 'controller'
})
export class MainController {
    version: any = 'ok lol';
    version2: any = 'ok lols';

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
