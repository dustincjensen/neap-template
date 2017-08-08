import { host, path, https, headers } from './externalDecorators';
import { ApiExternal } from './apiExternal';
import { Http } from '../utils/server/http';

@https()
@host('api.github.com')
@headers({ 'user-agent': 'neap-template' })
export class Github extends ApiExternal {

    /**
     * An example of a get request with no parameters in the
     * path of the string.
     */
    @path('/users', Http.Type.GET)
    public async getUsers(): Promise<(payload: any) => Promise<any>> {
        return (payload: any) => {
            return payload[0];
        };
    }

    /**
     * An example of a get request with 1 parameter in the path of the string.
     * @param username the username of the github user we should retrieve.
     */
    @path('/users/{0}', Http.Type.GET)
    public async getUser(username: string): Promise<(payload: any) => Promise<any>> {
        return (payload: any) => {
            return payload;
        }
    }
}