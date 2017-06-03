import { Api } from './_api';

/**
 * This decorator puts the path variable into the API
 * base class so that it sets up the routes according
 * to the decorator.
 * @param route the path for the api route.
 */
export function generateProxy(route: string) {
    return function (target: Function) {
        target.prototype.path = route;
    }
}

/**
 * 
 */
export function proxyMethod() {
    return function (target: Api, name: string, methodDescriptor: TypedPropertyDescriptor<(obj: any) => Promise<any>>) {
        // If it hasn't been instantiated yet, we need to do so.
        if (target.routeDefinitions === null || target.routeDefinitions === undefined) {
            target.routeDefinitions = [];
        }

        // After it has been instantiated then we can add 
        // the route definition. This consists of the method name
        // and the method itself, to be called by the _api create
        // method.
        target.routeDefinitions.push({
            name: name,
            method: methodDescriptor.value
        });
    }
}

export function proxyType() { return undefined; }