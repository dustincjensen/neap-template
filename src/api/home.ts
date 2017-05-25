import { Api, RouteDefinition } from './_api';
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

    constructor() {
        super();
        this.routeDefinitions = [
            {
                path: '/api/home/getHomeDashboard',
                method: this.getHomeDashboard
            },
            {
                path: '/api/home/giveMeData',
                method: this.giveMeData
            }
        ];
    }

    @proxyMethod()
    private async getHomeDashboard(): Promise<TakeThatData> {
        return {
            stuff: {
                paramOne: 'Home',
                paramTwo: 'Dashboard'
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