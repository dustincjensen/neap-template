import { Http } from '../utils/server/http';

export class ApiExternal {

    public host: string;
    public https: boolean;
    public headers: Object;

    constructor() {
    }

    public async getOptions(path: string): Promise<Http.Options> {
        return {
            https: this.https,
            host: this.host,
            headers: this.headers,
            path: path
        };
    }

    public async handleGetRequest(options: Http.Options): Promise<any> {
        let response = await Http.get(options);
        if (response.statusCode !== 200) {
            throw new Error(response.body);
        }
        return response.body;
    }
}