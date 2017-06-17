import { Pool } from "pg";

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
        let tx = new Transaction(this._pool);

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

export class Transaction {
    private static BEGIN: string = 'BEGIN;';
    private static COMMIT: string = 'COMMIT;';
    private static ROLLBACK: string = 'ROLLBACK';

    /**
     * TODO something to initialize a database transaction.
     * TODO does this need a ref to the database layer?
     *      is that where we will hook up the reference to our
     *      database of choice?
     */
    constructor(private _pool: Pool) {
    }

    /**
     * Begins a Postgres transaction.
     * TODO should be protected in some way? So only the database class can begin/commit/rollback.
     */
    public async begin(): Promise<void> {
        await this._pool.query(Transaction.BEGIN);
    }

    /**
     * Commits a Postgres transaction.
     * TODO should be protected in some way? So only the database class can commit/rollback.
     */
    public async commit(): Promise<void> {
        await this._pool.query(Transaction.COMMIT);
    }

    /**
     * Rolls back a Postgres transaction.
     * TODO should be protected in some way? So only the database class can commit/rollback.
     */
    public async rollback(): Promise<void> {
        await this._pool.query(Transaction.ROLLBACK);
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
     * @param queryString a query to run in the database.
     * @param queryParameters the parameters that will be passed to queryString.
     */
    public async querySingle<T>(queryString: string, queryParameters?: any[]): Promise<T> {
        let result = await this._pool.query(queryString, queryParameters || null);
        return result.rows[0] as T;
    }
}
