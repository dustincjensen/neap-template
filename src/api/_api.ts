import { Database } from '../db/database';
import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';

class ProxyMethodDefinition {
    name: string;
    method: (param?: any) => Promise<any>;
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
     * The API's give us references to hold onto.
     * @param db the reference to the database layer.
     */
    constructor(protected db: Database) {
    }

    /**
     * This method uses the route definitions that are populated
     * by @proxyMethod decorators in conjuction with the path
     * that is populated by the @generateProxy decorator to build
     * the routes for the service.
     * @param router this is where the routes will live
     */
    public create(router: Router): void {
        for (let i = 0; i < this.routeDefinitions.length; i++) {
            let route = this.routeDefinitions[i];
            let methodPath = path.posix.join(this.path, route.name);
            router.post(methodPath, (req, res, next) =>
                this.handleRequest(route.method, req, res, next));
        }
    }

    private async handleRequest(
        method: (param?: any) => Promise<any>,
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            // In order to support simple parameters like number, string...
            // we wrap all the proxy calls in a json object. This is where
            // we unwrap it, so we have the correct object for our calls.
            let requestBody = req.body.data;

            // We do method.apply so we can tell it to run with the
            // context of the 'this' pointer instead of whatever it
            // would be.
            let responseBody = await method.apply(this, [requestBody]);

            // If everything was good then we will respond 
            // with a 200 message.
            res.status(200).json({ data: responseBody });
        } catch (ex) {
            console.log(ex);
            res.status(500).json({ error: ex });
        }
    }
}