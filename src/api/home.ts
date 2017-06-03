import { Api } from './_api';
import { proxyType, generateProxy, proxyMethod } from './_proxyDecorators';

@proxyType()
export class GiveMeData {
    paramOne: string;
    paramTwo: string;
}

@proxyType()
export class TakeThatData {
    stuff: GiveMeData;
}

@generateProxy('/api/home/')
export class HomeApi extends Api {

    private _futureDatabaseRef: any = {
        homeMessageOne: 'Home',
        homeMessageTwo: 'FromPrivateRef'
    };

    // Route method definitions need to be wrapped
    // in order to keep the context of this.
    constructor() {
        super();
    }

    @proxyMethod()
    private async getHomeDashboard(): Promise<TakeThatData> {
        return {
            stuff: {
                paramOne: this._futureDatabaseRef.homeMessageOne,
                paramTwo: this._futureDatabaseRef.homeMessageTwo
            }
        };
    }

    @proxyMethod()
    private async giveMeData(payload: GiveMeData): Promise<GiveMeData> {
        console.log(payload);
        return {
            paramOne: 'I gave you new data',
            paramTwo: 'Aren\'t you proud of me?'
        }
    }
}