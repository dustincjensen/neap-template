import { Api } from './_api';
import { generateProxy, proxyMethod } from './_proxyDecorators';

@generateProxy('/api/login/')
export class LoginApi extends Api {

    constructor() {
        super();
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