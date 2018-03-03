import { Request } from 'express';
import { Database } from "../db/database";

export interface CompositeRequest extends Request {
    db: Database;
}