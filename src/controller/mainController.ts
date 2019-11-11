import {Controller} from "../core/base.controller";


import './controller.scss';
import tmpl from './controller.html';

@Controller({
    template: tmpl,
    name: 'controller'
})
export class MainController {
    version: any = 'ok lol';

    constructor() {
    }

    addEventListeners = () => {
        console.log('adding eventlisteners');
        document.getElementById('reloadSelected').addEventListener('click', () => {
            console.log('clicked!!');
            this.version = (document.getElementById('input') as HTMLInputElement).value;
            // this.version++;
            this['detectChanges']();
        });
    };

    afterRender = () => {
        this.addEventListeners();
    };


}
