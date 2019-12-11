import {Renderer} from "../rendering/renderer";

export interface View {
    evalFromView: (evalData: any) => any;
    element: HTMLElement;
    detectChanges: () => void;
    renderer: Renderer;
}