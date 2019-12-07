import {View} from "./interfaces";
import {DomUtils, ExtendedElement} from "../../shared/dom.utils";
import {GeneralUtils} from "../../shared/general.utils";
import {BindingState} from "../states/binding.state";
import {DecoratedBinding} from "../decorators/binding.decorator";

interface IgnoreWhenAttributeMatches {
    attr: string;
    ignoreChilds?: boolean;
}

export class ContentBindings implements DecoratedBinding {
    bindingKey: string = 'content-bind';
    state: BindingState = new BindingState();
    eventListeners: {} = {};
    selector: string;
    name: string = 'content';
    static bindingName = 'content';
    static toIgnore: IgnoreWhenAttributeMatches[] = [];

    constructor(public viewElement: HTMLElement, public view: View) {
        ContentBindings.toIgnore = [
            // {attr: 'for', ignoreChilds: true}
        ]
    }

    addChildAttributeToEveryChild(root: HTMLElement, attr: string) {
        for (let i = 0; i <= root.children.length; i++) {
            if (root.children[i]) {
                root.children[i].setAttribute(attr + '-child', 'true');
                this.addChildAttributeToEveryChild(root.children[i] as HTMLElement, attr);
            }
        }
    }

    isToIgnore(templateChild: HTMLElement): number[] | undefined {
        let toIgnoreIndexList: number[] = [];
        ContentBindings.toIgnore.map((ig, i) => {
            if (templateChild.getAttribute(ig.attr)
                || (ig.ignoreChilds && templateChild.getAttribute(ig.attr + '-child'))) {
                toIgnoreIndexList.push(i);
            }
        });
        return toIgnoreIndexList.length === 0 ? undefined : toIgnoreIndexList;
    }

    public initBinding(templateChild: HTMLElement) {
        let toIgnoreIndexList: number[] | undefined = this.isToIgnore(templateChild);
        let evalMatches = DomUtils.getDirectInnerText(templateChild).match(/{{([^]*?)}}/g);
        // evalMatches = evalMatches ? evalMatches : [];
        // !templateChild.getAttribute('for') && !templateChild.getAttribute('for-child')
        if (evalMatches && !toIgnoreIndexList) {
            evalMatches.map((evalMatch: string) => {
                //  fix to make ignore index list removable
                if (GeneralUtils.isFunction(evalMatch)) {
                    //console.log('FOUND FUNCTION', GeneralUtils.extractFunctionName(evalMatch));
                    // console.log(GeneralUtils.extractFunctionParams(evalMatch));
                    let paramsResolvable: boolean = true;
                    const allParams: string[] = GeneralUtils.extractFunctionParams(evalMatch);
                    allParams.map(p => {
                        if (p.indexOf('this.') === -1) {
                            paramsResolvable = false;
                        }
                    });
                    if (paramsResolvable) {
                        this.renderEvalInElement(templateChild, evalMatch);
                    }

                } else {
                    if (evalMatch.indexOf('this') !== -1) {

                        this.renderEvalInElement(templateChild, evalMatch);
                    }
                }

            });
        } else if (toIgnoreIndexList/*templateChild.getAttribute('for')*/) {
            toIgnoreIndexList.map(i => {
                this.addChildAttributeToEveryChild(templateChild, ContentBindings.toIgnore[i].attr);
            });

        }

    }

    renderEvalInElement(curE: HTMLElement, evalMatch: string) {
        // console.log(DomUtils.getDirectInnerText(curE));
        let shouldReplace: boolean = true;
        //if children also matches the same eval, don't replace value in template!
        // if (curE.children.length > 0 && (curE.children[0] as HTMLElement).innerText.match(evalMatch)) {
        if (curE.children.length > 0 && DomUtils.getDirectInnerText(curE.children[0] as HTMLElement).match(evalMatch)) {
            shouldReplace = false;
            if (!curE.children[0].getAttribute(this.bindingKey)) {
                this.renderEvalInElement(curE.children[0] as any, evalMatch);
                // console.log('recrusive', curE.children[0]);
            }
        } else {
            let hash = this.state.getHashForEval(evalMatch);
            let newHash: string;
            // element allready has some template variable replaced
            if (curE.getAttribute(this.bindingKey)) {

                newHash = GeneralUtils.createRandomHash();
                this.state.saveEvalForHash(newHash, evalMatch);
                hash = curE.getAttribute(this.bindingKey) + ' ' + newHash;
                // console.log('allready has watch id..');
                // return;
                // MAKE WATCH ID A LIST!!
                // hash = curE.getAttribute('watch-id');
                // return;
            }
            // console.log('going on..');
            // this.displayTemplate = this.config.template;
            // same eval can use the same hash!! UPDATE TO QUERYSELECTOR ALL


            if (!hash) {
                hash = GeneralUtils.createRandomHash();
                this.state.saveEvalForHash(newHash ? newHash : hash, evalMatch);
                // this.state.hashForEval[evalMatch] = hash;
            }


            const data = this.evalTemplateFunction(evalMatch);
            this.state.setLastValueForHash(newHash ? newHash : hash, data);

            curE.innerHTML = curE.innerHTML.replace(evalMatch, `<!--${newHash ? newHash : hash}!-->` + data + `<!--${newHash ? newHash : hash}!-->`);
            curE.setAttribute(this.bindingKey, hash);

        }
    }

    evalTemplateFunction = (funcStr: string): any => {
        const funcToEval: string = funcStr.replace('{{', '').replace('}}', '');
        // .replace(/this/g, 'this.controller');
        //console.log(funcToEval);
        // console.log(eval(funcToEval));
        // @ts-ignore
        return this.view.evalFromView(funcToEval);
    };

    updateSchedule() {
        for (let hash in this.state.getEvalForHashList()) {

            if (this.state.getEvalForHash(hash)) {

                const data = this.evalTemplateFunction(this.state.getEvalForHash(hash));
                const elList: HTMLElement[] = Array.prototype.slice.call(this.view.element.querySelectorAll(`[${this.bindingKey}~="${hash}"]`));

                // query selector all since we are using a hash mutliple times if possible!!
                elList.map((el: HTMLElement, index: number) => {
                    this.reRenderElement(el, hash, data);
                });

            }
        }
    }


    reRenderElement(el: HTMLElement, hash: string, data: any) {
        if (!el.getAttribute('for')) {
            el.innerHTML = el.innerHTML.replace(new RegExp(`<!--${hash}!-->([^]*?)<!--${hash}!-->`, 'g'), `<!--${hash}!-->` + data + `<!--${hash}!-->`);
        }

    }

    replaceHashInDom = (hash: string, newHash: string) => {
        if (this.view.element.querySelector) {
            const el = this.view.element.querySelector(`[${this.bindingKey}~="${hash}"]`);
            if (el) {
                const hashList = el.getAttribute(this.bindingKey);
                // console.log(hashList);
                // const eventListenersBackup = (el as ExtendedElement).getEventListeners();
                el.innerHTML = el.innerHTML.replace(new RegExp(hash, 'g'), newHash);
                el.setAttribute(this.bindingKey, hashList.replace(hash, newHash));
            }
        }
    };

    reduceMappings() {
        this.state.reduceMappings(this.replaceHashInDom);
    }
}