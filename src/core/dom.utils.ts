export class DomUtils {

    public static createDeepSelectorString(ele: HTMLElement) {
        return DomUtils.getSelectorList(ele).join(' > ');
    }

    public static addEventListeners(ele: any, listeners: any) {
        for (let key in listeners) {
            listeners[key].map(listener => {
                console.log(`Adding ${key} listener to ${ele.nodeName}`);
                ele.addEventListener(key, listener.listener);
            });
        }
        // console.log(this.eventListeners);
    }

    public static getSelectorList = (ele: HTMLElement, list: string[] = [], resolvedOneClassName: boolean = false) => {
        const selector: string = DomUtils.getSelector(ele);
        list.push(selector);

        if (selector.indexOf('#') !== -1) {
            // stop at id level, since ids are unique!!
            return list.reverse();
        }
        if (ele.parentElement) {
            return DomUtils.getSelectorList(ele.parentElement, list, resolvedOneClassName);
        } else {
            return list.reverse();
        }
    };

    public static walkThroughAllChilds(ele: HTMLElement,
                                       cb: (ele: HTMLElement) => void) {

        cb(ele as any);

        if (ele.childElementCount > 0) {
            for (let i = 0; i < ele.childElementCount; i++) {
                this.walkThroughAllChilds(ele.children[i] as HTMLElement, cb);
            }
        }
    }
    public static onAppend = (elem: HTMLElement, f: any) => {
        let observer = new MutationObserver(function (mutations) {
            mutations.forEach((m) => {
                if (m.addedNodes.length) {
                    f(m.addedNodes)
                }
            })
        });
        observer.observe(elem, {childList: true})
    };
    private static getSelector = (ele: HTMLElement) => {
        if (ele.id) {
            return '#' + ele.id.split(' ').join(('#'));
        }
        if (ele.className) {
            return ele.nodeName + '.' + ele.className.split(' ').join(('.'));
        } else {
            return ele.nodeName;
        }
    };

}