import { Http } from '../utils/server/http';

export class ApiExternal {

    /**
     * Provided to us via the Host decorator.
     */
    public host: string;

    /**
     * Set to true by the Https decorator.
     */
    public https: boolean;

    /**
     * An object defining the headers of the http call
     * given to use by the Headers decorator.
     */
    public headers: Object;

    /**
     * Returns the options that the Http call will need in order
     * to perform the call on the external api's behalf.
     * @param path the path to the method we should be calling.
     *             This is set from the decorator on the method.
     */
    public async getOptions(path: string): Promise<Http.Options> {
        return {
            https: this.https,
            host: this.host,
            headers: this.headers,
            path: path
        };
    }

    /**
     * Calls the server static methods for a get request.
     * @param options the options for the get request.
     */
    public async handleGetRequest(options: Http.Options): Promise<any> {
        let response = await Http.get(options);
        if (response.statusCode !== 200) {
            throw new Error(response.body);
        }
        return response.body;
    }
}