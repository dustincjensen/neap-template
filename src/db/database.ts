export class Database {
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
        let tx = new Transaction();

        // We need to wrap our call to (func) in a try catch.
        // This is because we don't know what the (func) is 
        // trying to do. So we have to assume that they will fail.
        try {
            // Wait for func to run and if everything was fine we will
            // commit the transaction. This allows us to delete, select,
            // insert, or update all in the same transaction.
            let value = await func(tx);
            await tx.commit();
            return value;
        }
        catch (ex) {
            // Oh no! We had an error. Well at least we can rollback the
            // transaction so we don't have any loose data.
            console.log('Rolling back because: ', ex);
            await tx.rollback();
            return null;
        }
    }
}

export class Transaction {
    /**
     * TODO something to initialize a database transaction.
     * TODO does this need a ref to the database layer?
     *      is that where we will hook up the reference to our
     *      database of choice?
     */
    constructor() {
    }

    /**
     * TODO write the contents of the commit method.
     * TODO should be protected in some way? So only the database class can commit/rollback.
     */
    public async commit(): Promise<void> {
    }

    /**
     * TODO write the contents of the rollback method.
     * TODO should be protected in some way? So only the database class can commit/rollback.
     */
    public async rollback(): Promise<void> {
    }

    /**
     * TODO write the contents of the query method.
     * TODO <T> return Promise<T> that way they can specify
     *      what type they are expecting in return.
     * @param queryString a query to run in the database.
     */
    public async query(queryString: string): Promise<any> {
        return { any: queryString };
    }
}
