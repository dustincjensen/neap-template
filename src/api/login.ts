import { Api, RouteDefinition } from './_api';
import { generateProxy, proxyMethod } from './_proxyDecorators';

@generateProxy('/api/login/')
export class LoginApi extends Api {

    constructor() {
        super();
        this.routeDefinitions = [
            {
                path: '/api/login/requestLoginChallenge',
                method: this.requestLoginChallenge
            },
            {
                path: '/api/login/respondToLoginChallenge',
                method: this.respondToLoginChallenge
            }
        ];
    }

    @proxyMethod()
    private async requestLoginChallenge(): Promise<any> {
        return {
            info: 'Hello World'
        };
    }

    @proxyMethod()
    private async respondToLoginChallenge(): Promise<void> {
        console.log('RespondToLoginChallenge: doing work... (not really)');
    }
}