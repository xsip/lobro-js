import {EventListenerHook} from "./core/eventListenerHook";
let eventListenerHook: EventListenerHook = new EventListenerHook();
import './core/polyfills';
import {MainController} from "./controller/mainController";


let controller: MainController = new MainController();
window['controller'] = controller;

