import { NextFunction, Request, Response, Router } from 'express';
import { Environment } from '../utils/server/environment';

export class IndexRoute {
    public static create(router: Router) {
        // Handle the / path and return our index.html file.
        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            res.sendFile('public/index.html', { root: '../' });
        });

        // Only serve up Typescript files if the node environment
        // is in development mode, because production shouldn't
        // have deployed source maps.
        if (Environment.isDevelopment()) {
            // Log to the console so we know we are adding access to /src/public.
            console.log(`${__filename}: Adding sourcemap route for Typescript files.`);

            // Limit the the getting of files to Typescript files and
            // limit it to only src/public so that we aren't leaking server code.
            // This will allow us to retrieve the Typescript files that our
            // source maps refer to!
            // If you want to check that the server code can't be released, 
            // try something like localhost:3000/src/api/example.ts with route
            // setup as it currently is.
            // Then to verify the file would be served if it was just '*.ts',
            // change it and do the same thing again.
            router.get('/src/public/**/*.ts', (req: Request, res: Response, next: NextFunction) => {
                res.sendFile(req.url, { root: '.' });
            });
        }
    }
}