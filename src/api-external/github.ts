
import { Http, Options } from '../utils/server/http';

// TODO create decorator
export class Github {

    // TODO move into decorator
    private static OPTIONS: Options = {
        host: 'api.github.com',
        headers: { 'user-agent': 'neap-template' },
        https: true };

    // TODO create decorator
    public static async getUser(username: string): Promise<any> {
        let options = Github.OPTIONS;
        options.path = `/users/${username}`;
        
        let response = await Http.get(options);
        if (response.statusCode !== 200) {
            throw new Error(response.body);
        }
        return response.body;
    }
}