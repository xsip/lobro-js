// need to be implemented first!!
import './core/polyfills';

import {MainController} from "./controller/mainController";
import {LoBroModule} from "./core/loBroModule";


// let controller: MainController = new MainController();
// window['controller'] = controller;
const module: LoBroModule = new LoBroModule({
    controller: [MainController],
});

module.bootstrap();
