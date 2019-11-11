export class UtilsClass {
    constructor() {
        const e = document.getElementById('hehe');
    }

    propertyHandler(element: HTMLElement, prop: string) {
        return {
            get: () => element.getAttribute(prop),
            set: (v: any) => element.setAttribute(prop, v)
        }
    }

    valueHandler(element: HTMLInputElement) {
        return {
            get: () => element.value,
            set: (v: any) => element.value = v
        }
    }
}