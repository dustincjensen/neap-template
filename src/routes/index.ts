import { NextFunction, Request, Response, Router } from 'express';

export class IndexRoute {
    public static create(router: Router) {
        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            res.sendFile('public/index.html', { root: '../' });
        });
    }
}