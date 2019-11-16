export interface IState {
    evalForHash: {};
    hashForEval: {};
    lastValueForHash: {};
    oldControllerData: {};
}

export class BindingState {
    private evalForHash: {} = {};
    private hashForEval: {} = {};
    private lastValueForHash: {} = {};
    private oldControllerData: {} = {};

    constructor() {

    }

    getEvalForHash(hash: string): string | undefined {
        return this.evalForHash[hash];
    }

    getEvalForHashList(): {} {
        return this.evalForHash;
    }

    saveEvalForHash(hash: string, evalData: string): void {
        this.evalForHash[hash] = evalData;
        // this.hashForEval[evalData] = hash;
    }

    generateHashForEvalList() {
        for (let hash in this.evalForHash) {
            this.hashForEval[this.evalForHash[hash]] = hash;
        }
    }

    reduceMappings = (replaceHashInDom: (hash: string, newHash: string) => void) => {
        // console.log('REDUCE MAPPINGS REDUCE MAPPINGSREDUCE MAPPINGSREDUCE MAPPINGSREDUCE MAPPINGS');
        const tmpEvalForHash: any = {};
        const toIgnore: string[] = [];
        for (let hash in this.evalForHash) {
            // console.log(hash);
            for (let hash2 in this.evalForHash) {
                if (hash2 !== hash && toIgnore.indexOf(hash2) === -1 && toIgnore.indexOf(hash) === -1 && this.evalForHash[hash2] === this.evalForHash[hash]) {
                    // console.log(`${hash} has same eval as ${hash2} ( ${this.evalForHash[hash]} ).. reducing!`);
                    toIgnore.push(hash2);
                    replaceHashInDom(hash2, hash);
                }
            }
        }
        toIgnore.map(i => delete this.evalForHash[i]).filter(i => i !== null && i !== undefined);
        this.generateHashForEvalList();
        // console.log('REDUCE MAPPINGS REDUCE MAPPINGSREDUCE MAPPINGSREDUCE MAPPINGSREDUCE MAPPINGSREDUCE MAPPINGS');
    };

    getHashForEval(hash: string): string | undefined {
        return this.evalForHash[hash];
    }

    setOldControllerProperty(prop: string, value: any): void {
        this.oldControllerData[prop] = value;
    }

    getOldControllerProperty(prop: string) {
        return this.oldControllerData[prop];
    }

    getLastValueForHash(hash: string) {
        return this.lastValueForHash[hash];
    }

    setLastValueForHash(hash: string, val: any): void {
        this.lastValueForHash[hash] = val;
    }

    getObject(): IState {
        return {
            evalForHash: this.evalForHash,
            hashForEval: this.hashForEval,
            lastValueForHash: this.lastValueForHash,
            oldControllerData: this.oldControllerData,
        }
    }

    setState(state: IState) {
        this.evalForHash = state.evalForHash;
        this.hashForEval = state.hashForEval;
        this.lastValueForHash = state.lastValueForHash;
        this.oldControllerData = state.oldControllerData;

    }
}
