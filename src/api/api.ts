import { Database } from '../db/database';
import { CompositeRequest } from './compositeRequest';
import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';

interface ProxyMethodDefinition {
    name: string;
    databaseParameter: number;
    requestParameter: number;
    method: (param?: any) => Promise<any>;
}

interface MethodDefinition {
    methodName: string;
    parameterType: "database" | "requestBody";
    parameterIndex: number;
}

export class Api {
    /**
     * Given to us by the @generateProxy decorator
     */
    public path: string;

    /**
     * This is populated by the @proxyMethod decorators.
     */
    public routeDefinitions: ProxyMethodDefinition[];

    /**
     * This is populated by parameter decorators
     */
    public methodDefinitions: MethodDefinition[];

    /**
     * This method uses the route definitions that are populated
     * by @proxyMethod decorators in conjuction with the path
     * that is populated by the @generateProxy decorator to build
     * the routes for the service.
     * @param router this is where the routes will live
     */
    public create(router: Router): void {
        for (let i = 0; i < this.routeDefinitions.length; i++) {
            const route = this.routeDefinitions[i];
            const methodPath = path.posix.join(this.path, route.name);

            // Find a method definition that has the database parameter.
            //route.databaseParameter = 
            const dbIndex = this.methodDefinitions.findIndex(v => 
                v.methodName === route.name && v.parameterType === "database");
            if (dbIndex !== -1) {
                route.databaseParameter = this.methodDefinitions[dbIndex].parameterIndex;
            }

            // Find a method definition that has the requestBody parameter.
            const requestIndex = this.methodDefinitions.findIndex(v => 
                v.methodName === route.name && v.parameterType === "requestBody");
            if (requestIndex !== -1) {
                route.requestParameter = this.methodDefinitions[requestIndex].parameterIndex;
            }

            router.post(methodPath, (req: CompositeRequest, res, next) =>
                this.handleRequest(route, req, res, next));
        }
    }

    private async handleRequest(
        route: ProxyMethodDefinition,
        req: CompositeRequest,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            // In order to support simple parameters like number, string...
            // we wrap all the proxy calls in a json object. This is where
            // we unwrap it, so we have the correct object for our calls.
            const requestBody = req.body.data;

            // Constructor the parameters we are going to pass into
            // the method when we call it.
            let methodParameters = [];
            
            // If they require the database add it to the method parameters.
            if (route.databaseParameter !== -1) {
                methodParameters[route.databaseParameter] = req.db;
            }

            // Place the request body in the right position.
            if (route.requestParameter !== -1) {
                methodParameters[route.requestParameter] = requestBody;
            }

            // We do method.apply so we can tell it to run with the
            // context of the 'this' pointer instead of whatever it
            // would be.
            // TODO are all our server calls doing to be promises?
            //      possible fix is to call "route.method.apply" then check if
            //      the assigned variable is a promise, if so then await it for
            //      the actual value.
            const responseBody = await route.method.apply(this, methodParameters);            

            // If everything was good then we will respond 
            // with a 200 message.
            res.status(200).json({ data: responseBody });
        } catch (ex) {
            console.log(ex);
            res.status(500).json({ error: ex });
        }
    }
}