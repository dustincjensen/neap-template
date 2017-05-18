import { NextFunction, Request, Response, Router } from 'express';

export class LoginRoute {

    // TODO: do route creation better
    public static create(router: Router) {
        router.get('/login/request', (req: Request, res: Response, next: NextFunction) => 
            LoginRoute.requestLoginChallenge(req, res, next));
    }

    private static requestLoginChallenge(req: Request, res: Response, next: NextFunction) {
        res.status(200).json({ data: 'Hello World' });
    }
}