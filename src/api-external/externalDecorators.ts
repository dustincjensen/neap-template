import { ApiExternal } from './apiExternal';
import { Http } from '../utils/server/http';

/**
 * 
 */
export function https() {
    return function (target: Function) {
        target.prototype.https = true;
    }
}

/**
 * 
 * @param host 
 */
export function host(host: string) {
    return function (target: Function) {
        target.prototype.host = host;
    }
}

/**
 * 
 * @param obj 
 */
export function headers(obj: Object) {
    return function (target: Function) {
        target.prototype.headers = obj;
    }
}

/**
 * 
 * @param path 
 * @param type 
 */
export function path(path: string, type: Http.Type) {
    return function (target: ApiExternal, name: string, methodDescriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<(payload: any) => Promise<any>>>) {
        let originalMethod = methodDescriptor.value;

        // Override the original method to do work...
        methodDescriptor.value = async function (...args: any[]): Promise<any> {
            let options = await target.getOptions(path.format(args));
            let response = await target.handleGetRequest(options);
            let responseJson = JSON.parse(response);
            let method = await originalMethod.apply(this);
            let finalValue = await method(responseJson);
            return finalValue;
        }

        // Return the method descriptor with the new function in place of it.
        return methodDescriptor;
    }
}

declare global {
    interface String {
        format(arg1: any, ...args: any[]): string;
    }
}

Object.defineProperty(String.prototype, 'format', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function () {
        let args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number] : match;
        });
    }
});