import { NextFunction, Request, Response, Router } from 'express';

export class RouteDefinition {
    path: string;
    method: (param?: any) => Promise<any>;
}

export class Api {

    protected routeDefinitions: RouteDefinition[];

    constructor() { }

    public create(router: Router): void {
        for (let i = 0; i < this.routeDefinitions.length; i++) {
            let apiCall = this.routeDefinitions[i];
            router.post(apiCall.path, (req, res, next) =>
                this.handleRequest(apiCall.method, req, res, next));
        }
    }

    private async handleRequest(
        method: (param?: any) => Promise<any>,
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            let requestBody = req.body;
            let responseBody = await method(requestBody);
            res.status(200).json({ data: responseBody });
        } catch (ex) {
            res.status(500).json({ error: ex });
        }
    }
}