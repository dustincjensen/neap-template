import { Api } from './api';
import { Database } from '../db/database';

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
 * This decorator adds the method names and method definitions
 * to the base class _api and is used when setting up the router.
 */
export function proxyMethod() {
    return function (target: Api, name: string, methodDescriptor: TypedPropertyDescriptor<(...params: any[]) => Promise<any>>) {
        // If it hasn't been instantiated yet, we need to do so.
        if (target.routeDefinitions === undefined || target.routeDefinitions === null) {
            target.routeDefinitions = [];
        }

        // Add it to the route definitions
        target.routeDefinitions.push({
            name: name,
            method: methodDescriptor.value,
            databaseParameter: -1,
            requestParameter: -1
        });
    }
}

export function database() {
    return function (target: Api, propertyKey: string, parameterIndex: number) {
        parameter(target, propertyKey, "database", parameterIndex);
    }
}

export function requestBody() {
    return function (target: Api, propertyKey: string, parameterIndex: number) {
        parameter(target, propertyKey, "requestBody", parameterIndex);
    }
}

function parameter(target: Api, propertyKey: string, parameterType: "database" | "requestBody", parameterIndex: number) {
    if (target.methodDefinitions === undefined || target.methodDefinitions === null) {
        target.methodDefinitions = [];
    }

    target.methodDefinitions.push({
        methodName: propertyKey,
        parameterType: parameterType,
        parameterIndex: parameterIndex
    });
}

/**
 * Nothing needs to be done at this time.
 */
export function proxyType() { return undefined; }