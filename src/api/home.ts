import { NextFunction, Request, Response, Router } from 'express';
import { generateProxy, proxyMethod } from './_proxyDecorators';

@generateProxy('/api/home/')
export class HomeApi {

    // TODO: do route creation better
    public static create(router: Router) {
        router.get('/api/home/getHomeDashboard', (req: Request, res: Response, next: NextFunction) =>
            HomeApi.getHomeDashboard(req, res, next));
    }

    @proxyMethod()
    private static getHomeDashboard(req: Request, res: Response, next: NextFunction) {
        res.status(200).json({ data: 'Home Dashboard' });
    }
}