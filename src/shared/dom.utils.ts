export interface ExtendedElement extends HTMLElement {
    getEventListeners: () => { [index: string]: any[] }
}

export class DomUtils {

    public static createDeepSelectorString(ele: HTMLElement) {
        return DomUtils.getSelectorList(ele).join(' > ');
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

    public static getDirectInnerText(ele: HTMLElement) {
        /*let txt = null;
        [].forEach.call(ele.childNodes, (v: any) => {

            if (v.nodeType == 3) txt = v.textContent.replace(/^\W*\n/, '');
        });
        return txt ? txt : '';*/

        var childNodes = ele.childNodes;
        let result = '';

        for (var i = 0; i < childNodes.length; i++) {
            if(childNodes[i].nodeType == 3) {
                result += (childNodes[i] as any).data;
            }
        }

        return result;
    }

}
