import { ApiExternal } from './apiExternal';
import { Http } from '../utils/server/http';

/**
 * If your external api uses https instead of http
 * then you should include this decorator.
 */
export function https<T extends typeof ApiExternal>() {
    return function (target: T) {
        target.prototype.https = true;
    }
}

/**
 * To set the host name of the external api, use this decorator.
 * An example of a host name would be, 'api.github.com' without
 * the https or http.
 * @param host the web address of the external api.
 */
export function host<T extends typeof ApiExternal>(host: string) {
    return function (target: T) {
        target.prototype.host = host;
    }
}

/**
 * If you need to set specific headers for all the calls then you
 * can set them here.
 * An example would be, { 'user-agent': 'programName' }
 * @param obj the object that defines the list of headers that should be included.
 */
export function headers<T extends typeof ApiExternal>(obj: Object) {
    return function (target: T) {
        target.prototype.headers = obj;
    }
}

/**
 * For individual method calls.
 * This allows you set the path for the api call and the type of call that should
 * be executed on your behalf.
 * @param path the path for the api call.
 * @param type the type of api call to do.
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