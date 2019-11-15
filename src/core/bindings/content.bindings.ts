import {View} from "./interfaces";
import {DomUtils, ExtendedElement} from "../../shared/dom.utils";
import {GeneralUtils} from "../../shared/general.utils";
import {BindingState} from "../states/binding.state";
import {_BindingClass} from "../decorators/binding.decorator";

export class ContentBindings implements _BindingClass {
    bindingKey: string = 'content-bind';
    state: BindingState = new BindingState();
    eventListeners: {} = {};
    selector: string;

    constructor(public viewElement: HTMLElement, public view: View) {

    }

    public initBinding(templateChild: HTMLElement) {
        const log: boolean = templateChild.className === 'test';
        let evalMatches = null // DomUtils.getDirectInnerText(templateChild).match(/{{([^]*?)}}/g);
        if (!evalMatches) {
            evalMatches = templateChild.innerText.match(/{{([^]*?)}}/g);
        }
        if (log) {
            console.log(evalMatches);
        }
        // evalMatches = evalMatches ? evalMatches : [];
        if (evalMatches) {
            if (log) {
                console.log('eval matches', evalMatches);
            }
            evalMatches.map((evalMatch: string) => {
                if (log) {
                    console.log('REPLACING REPLACING, ', evalMatch);
                }
                this.renderEvalInElement(templateChild, evalMatch);
            });
        }

    }

    renderEvalInElement(curE: HTMLElement, evalMatch: string) {
        const log: boolean = curE.className === 'test';

        // console.log(DomUtils.getDirectInnerText(curE));
        let shouldReplace: boolean = true;
        //if children also matches the same eval, don't replace value in template!
        // if (curE.children.length > 0 && (curE.children[0] as HTMLElement).innerText.match(evalMatch)) {
        if (curE.children.length > 0 && (DomUtils.getDirectInnerText(curE.children[0] as HTMLElement).match(evalMatch))){ //||
            //(curE.children[0] as HTMLElement).innerText.match(evalMatch)) {
            shouldReplace = false;
            if (!curE.children[0].getAttribute(this.bindingKey)) {
                this.renderEvalInElement(curE.children[0] as any, evalMatch);
                console.log('recrusive', curE.children[0]);
            }
        } else {
            if (log) {
                console.log('going to replace');
            }

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
                if (log) {
                    console.log('creating new hash!!');
                }
                this.state.saveEvalForHash(newHash ? newHash : hash, evalMatch);
                // this.state.hashForEval[evalMatch] = hash;
            }


            const data = this.evalTemplateFunction(evalMatch);
            if (log) {
                console.log('replacing with ', data);
            }
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
                elList.map(el => {
                    this.reRenderElement(el, hash, data);
                });

            }
        }
    }

    saveEventListeners() {
        DomUtils.walkThroughAllChilds(this.view.element, (ele) => {
            this.eventListeners[DomUtils.createDeepSelectorString(ele)] = (ele as any/*ExtendedElement*/).getEventListeners();
        });
        // console.log(this.eventListeners);
    }

    addEventListeners(ele: any /*E>XTENDED ELEMENT*/, listeners: any) {
        for (let key in listeners) {
            listeners[key].map(listener => {
                // console.log(`Adding ${key} listener to ${ele.nodeName}`);
                ele.addEventListener(key, listener.listener);
            });
        }
        // console.log(this.eventListeners);
    }

    reRenderElement(el: HTMLElement, hash: string, data: any) {
        const eventListenersBackup = (el as any /*ExtendedElement*/).getEventListeners();
        el.innerHTML = el.innerHTML.replace(new RegExp(`<!--${hash}!-->([^]*?)<!--${hash}!-->`, 'g'), `<!--${hash}!-->` + data + `<!--${hash}!-->`);

        if (eventListenersBackup && !(el as any /*ExtendedElement*/).getEventListeners()) {
            console.log('had eventlisteners which are missing now!!');
            this.addEventListeners(el as any /*ExtendedElement*/, eventListenersBackup);
        } else {
            // test
            // console.log(eventListenersBackup);
            // console.log((el as ExtendedElement).getEventListeners());
        }

    }

    replaceHashInDom = (hash: string, newHash: string) => {

        const el = this.view.element.querySelector(`[${this.bindingKey}~="${hash}"]`);

        const hashList = el.getAttribute(this.bindingKey);
        // console.log(hashList);
        const eventListenersBackup = (el as ExtendedElement).getEventListeners();
        el.innerHTML = el.innerHTML.replace(new RegExp(hash, 'g'), newHash);
        el.setAttribute(this.bindingKey, hashList.replace(hash, newHash));
        if (eventListenersBackup && !(el as ExtendedElement).getEventListeners()) {
            console.log('had eventlisteners which are missing now!!');
            this.addEventListeners(el as ExtendedElement, eventListenersBackup);
        } else {
            // console.log(eventListenersBackup);
            // console.log((el as ExtendedElement).getEventListeners());
        }

    };

    reduceMappings() {
        // this.state.reduceMappings(this.replaceHashInDom);
    }
}