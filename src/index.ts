import './core/polyfills';
import {EventListenerHook} from "./core/eventListenerHook";

import {MainController} from "./controller/mainController";
import {LoBroModule} from "./core/loBroModule";

let eventListenerHook: EventListenerHook = new EventListenerHook();
let controller: MainController = new MainController();
window['controller'] = controller;
const module: LoBroModule = new LoBroModule({
    controller: [controller],
});
eventListenerHook.setModule(module);
// bootstrap<MainController>(MainController);
// const [mainControllerInstance, release1] = bootstrap<MainController>(MainController);