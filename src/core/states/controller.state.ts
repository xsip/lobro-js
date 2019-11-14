export class ControllerState {
    private oldControllerData: any = {};

    constructor() {

    }

    setOldControllerProperty(prop: string, value: any): void {
        this.oldControllerData[prop] = value;
    }

    getOldControllerProperty(prop: string) {
        return this.oldControllerData[prop];
    }
}
