export class GeneralUtils {
    static createRandomHash = (length: number = 10): string => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    static extractFunctionParams = (evalFun: string): string[] => {
        var rx = /\((.*)\)/g;
        var arr = rx.exec(evalFun);
        return arr[0].substr(1, arr[0].length - 2).split(',');
    };
    static extractFunctionName = (evalFun: string): string => {
        return evalFun.replace(/\((.*)\)/g, '').replace('{{', '').replace('}}', '');
    };

    static isFunction = (evalFun: string): boolean => {
        return !!evalFun.match(/([^]*?)\(([^]*?)\)/g);
    }

}