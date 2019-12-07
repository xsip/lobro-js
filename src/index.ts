import {DemoController} from "./core/demo/demo-controller/demo-controller";
import {LoBroModule} from "./core/loBroModule";
import {HeaderController} from "./core/demo/header-controller/header-controller";

window.onload = () => {

    const module: LoBroModule = new LoBroModule({
        controller: [HeaderController, DemoController],
    });
    module.bootStrap();

}