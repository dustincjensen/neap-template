import { NextFunction, Request, Response, Router } from 'express';

export class LoginApi {

    // TODO: do route creation better
    public static create(router: Router) {
        router.get('/api/login', (req: Request, res: Response, next: NextFunction) => 
            LoginApi.requestLoginChallenge(req, res, next));
    }

    private static requestLoginChallenge(req: Request, res: Response, next: NextFunction) {
        res.status(200).json({ data: 'Hello World' });
    }
}