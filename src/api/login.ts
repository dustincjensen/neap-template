import { Api } from './api';
import { Database, Transaction } from '../db/database';
import { generateProxy, proxyMethod } from './proxyDecorators';

@generateProxy('/api/login/')
export class LoginApi extends Api {

    constructor(database: Database) {
        super(database)
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