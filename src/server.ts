import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import errorHandler = require('errorhandler');
import methodOverride = require('method-override');
import dotenv = require('dotenv');

import { Extensions } from './utils/server/extensions';
import { Database } from './db/database';
import { IndexRoute } from './routes/index';
import { Api } from './api/_export';

export class Server {
    public app: express.Application;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.api();
    }

    public config() {
        // Initialize extensions we have created
        // in the utils server extensions folder.
        Extensions.initialize();

        // This reads the .env from from the root
        // and sets up our database variables.
        dotenv.config();

        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(cookieParser('SECRET_GOES_HERE'));
        this.app.use(methodOverride());
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            err.status = 404;
            next(err);
        });
        this.app.use(errorHandler());
    }

    /**
     * Creates the api routes that will serve up data.
     */
    public api() {
        let router: express.Router = express.Router();
        let db = new Database();

        // Create the api's by giving them the database
        // reference. Then call create to create the API
        // routes they will provide to the client.        
        new Api.ExampleApi(db).create(router);

        // Use the router in express to handle the requests.
        this.app.use(router);
    }

    /**
     * Creates the index route which will serve up
     * the index.html file.
     */
    public routes() {
        let router: express.Router;
        router = express.Router();
        IndexRoute.create(router);
        this.app.use(router);
    }
}