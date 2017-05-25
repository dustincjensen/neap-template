import { NextFunction, Request, Response, Router } from 'express';
import { generateProxy, proxyMethod } from './_proxyDecorators';

@generateProxy('/api/login/')
export class LoginApi {

    // TODO: do route creation better
    public static create(router: Router) {
        router.get('/api/login/requestLoginChallenge', (req: Request, res: Response, next: NextFunction) =>
            LoginApi.requestLoginChallenge(req, res, next));
    }

    @proxyMethod()
    private static requestLoginChallenge(req: Request, res: Response, next: NextFunction) {
        res.status(200).json({ data: 'Hello World' });
    }

    @proxyMethod()
    private static respondToLoginChallenge(req: Request, res: Response, next: NextFunction) {
        res.status(200).json({ data: 'Hello World Again! ' });
    }
}