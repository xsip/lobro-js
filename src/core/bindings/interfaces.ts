export interface View {
    evalFromView: (evalData: any) => any;
    element: HTMLElement;
    detectChanges: () => void;
}