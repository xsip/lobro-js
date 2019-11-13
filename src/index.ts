import {DemoController} from "./demo-controller/demo-controller";
import {LoBroModule} from "./core/loBroModule";

window.onload = () => {

    const module: LoBroModule = new LoBroModule({
        controller: [DemoController],
    });
    module.bootStrap();

}