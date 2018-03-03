import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as path from 'path';
import errorHandler = require('errorhandler');
import methodOverride = require('method-override');
import dotenv = require('dotenv');

import { Database } from './db/database';
import { IndexRoute } from './routes/index';
import { Api, CompositeRequest } from './api/_export';

export class Server {
    public app: express.Application;
    private _db: Database;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = express();
        this._env();
        this._config();
        this._routes();
        this._api();
    }

    /**
     * Environment setup.
     * We can read the .env file and create content
     * we will need to share elsewhere in the application.
     */
    private _env() {        
        dotenv.config();
        this._db = new Database();
    }

    /**
     * Setup middleware and other config.
     */
    private _config() {
        // Allow express to serve files from the public directory.
        this.app.use(express.static(path.join(__dirname, 'public')));

        // Middleware setup.
        this._expressMiddleware();
        this._customMiddleware();
    }

    /**
     * Typical express middleware.
     */
    private _expressMiddleware() {        
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser('SECRET_GOES_HERE'));
        this.app.use(methodOverride());
        this.app.use((err, req, res, next) => {
            err.status = 404;
            next(err);
        });
        this.app.use(errorHandler());
    }

    /**
     * If you need to do something of your own you can do it here.
     */
    private _customMiddleware() {
        // Middleware to provide the database to each request.
        this.app.use((req: CompositeRequest, res, next) => {
            req.db = this._db;
            next();
        });
    }

    /**
     * Creates the api routes that will serve up data.
     */
    private _api() {
        let router: express.Router = express.Router();
        new Api.ExampleApi().create(router);
        this.app.use(router);
    }

    /**
     * Creates the index route which will serve up
     * the index.html file.
     */
    private _routes() {
        let router: express.Router = express.Router();
        IndexRoute.create(router);
        this.app.use(router);
    }
}