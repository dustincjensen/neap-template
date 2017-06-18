import { Pool } from 'pg';

export class Database {

    private _pool: Pool;

    /**
     * Postgres, create a pool.
     * This pool will handle our connections and we can just
     * ask it to run queries for us. However, 
     */
    constructor() {
        this._pool = new Pool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_SOURCE
        });
    }

    /**
     * This will give the func parameter a transaction to use to
     * make all of their database requests.
     * This is typed to T so that you can specify what type of value you 
     * expect back from the transaction. For example if your transaction is
     * querying to build an object, then that object type would be T.
     * @param func a method that takes a transaction and is awaitable.
     */
    public async transaction<T>(func: (transaction: Transaction) => Promise<T>): Promise<T> {
        // Create a transaction so that all of our queries can be rolled
        // back as one in the event that something goes wrong.
        let tx = new CommittableTransaction(this._pool);

        // We need to wrap our call to (func) in a try catch.
        // This is because we don't know what the (func) is 
        // trying to do. So we have to assume that they will fail.
        try {
            // Wait for func to run and if everything was fine we will
            // commit the transaction. This allows us to delete, select,
            // insert, or update all in the same transaction.
            await tx.begin();
            let value = await func(tx);
            await tx.commit();
            return value;
        }
        catch (ex) {
            // Oh no! We had an error. Well at least we can rollback the
            // transaction so we don't have any loose data.
            console.log('Rolling back because: ', ex);
            await tx.rollback();
            throw ex;
        }
    }
}

/**
 * We implement the interface Transaction so that when we give
 * the interface to the API calls, we don't expose BEGIN, COMMIT
 * and ROLLBACK to them. Commiting and rolling back are handled 
 * by Database.
 */
export interface Transaction {
    query<T>(queryString: string, queryParameters?: any[]): Promise<T>;
    querySingle<T>(queryString: string, queryParameters?: any[]): Promise<T>;
}

/**
 * Used by Database to create transactions around
 * the queries. This is not exported so that the API
 * cannot COMMIT or ROLLBACK manually.
 */
class CommittableTransaction implements Transaction {
    private static BEGIN: string = 'BEGIN;';
    private static COMMIT: string = 'COMMIT;';
    private static ROLLBACK: string = 'ROLLBACK;';

    /**
     * Gets a reference to the Postgres connection pool for querying.
     * @param _pool the Postgres connection pool.
     */
    constructor(private _pool: Pool) {
    }

    /**
     * Begins a Postgres transaction.
     */
    public async begin(): Promise<void> {
        await this._pool.query(CommittableTransaction.BEGIN);
    }

    /**
     * Commits a Postgres transaction.
     */
    public async commit(): Promise<void> {
        await this._pool.query(CommittableTransaction.COMMIT);
    }

    /**
     * Rolls back a Postgres transaction.
     */
    public async rollback(): Promise<void> {
        console.log('ROLLING BACK');
        await this._pool.query(CommittableTransaction.ROLLBACK);
    }

    /**
     * Uses the pool to query Postgres with the given queryString and query Parameters.
     * @param queryString a query to run in the database.
     * @param queryParameters the parameters that will be passed to queryString.
     */
    public async query<T>(queryString: string, queryParameters?: any[]): Promise<T> {
        let result = await this._pool.query(queryString, queryParameters || null);
        return result.rows as T;
    }

    /**
     * Uses the pool to query Postgres with the given queryString and query Parameters.
     * Only returns the first row of the query. Throws an error if more than one row is
     * returned from the query.
     * @param queryString a query to run in the database.
     * @param queryParameters the parameters that will be passed to queryString.
     */
    public async querySingle<T>(queryString: string, queryParameters?: any[]): Promise<T> {
        let result = await this._pool.query(queryString, queryParameters || null);

        // Check to see if we are returning more than a single row.
        // If we are, then the query that was passed to us is wrong.
        if (result.rows.length > 1) {
            throw new OneRecordExpected('querySingle: More than one record was returned.');
        }

        // Return the single row.
        return result.rows[0] as T;
    }
}

/**
 * This exception is for querySingle.
 * We only expect 1 record so if we get more than one,
 * we have an issue.
 */
class OneRecordExpected extends Error {
    constructor(message?: string) {
        super();
        this.name = 'OneRecordExpected';
        this.message = message;
    }
}