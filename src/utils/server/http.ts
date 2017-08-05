import * as http from 'http';
import * as https from 'https';

export interface Options {
    headers: any;
    https: boolean;
    host: string;
    path?: string;
}

export interface Response {
    statusCode: number;
    body: any;
}

export class Http {

    /**
     * Does a get request on behalf of the requestor and returns a promise.
     * @param options the http options.
     */
    public static async get(options: Options): Promise<Response> {
        return new Promise<Response>(async (resolve, reject) => {
            let requestOptions = {
                host: options.host,
                path: options.path,
                headers: options.headers
            };

            let request = options.https
                ? https.get(requestOptions, async (response) => await this._response(response, resolve, reject))
                : http.get(requestOptions, async (response) => await this._response(response, resolve, reject));
        });
    }

    /**
     * Called by .get for the callback and resolve or rejects the promise that
     * was created in the (get) method.
     * @param response the response to handle.
     * @param resolve the method to resolve the promise.
     * @param reject the method to reject the promise.
     */
    private static async _response(
        response: http.IncomingMessage | https.IncomingMessage,
        resolve: any,
        reject: any
    ): Promise<any> {
        try {
            let handledResponse = await Http._handleResponse(response);
            resolve(handledResponse);
        } catch (error) {
            reject(error);
        }
    }

    /**
     * Creates a promise and waits for the response data to stream in.
     * Once all the data has streamed in the promise can resolve.
     * @param response the response to handle.
     */
    private static _handleResponse(response: http.IncomingMessage | https.IncomingMessage): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            let body = '';
            response.on('data', data => {
                body += data;
            });
            response.on('error', error => {
                reject(error);
            });
            response.on('end', () => {
                resolve({
                    statusCode: response.statusCode,
                    body: body
                });
            });
        });
    }
}