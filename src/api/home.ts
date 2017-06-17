import { Api } from './_api';
import { Database, Transaction } from '../db/database';
import { proxyType, generateProxy, proxyMethod } from './_proxyDecorators';

@proxyType()
export class GiveMeData {
    paramOne: string;
    paramTwo?: string;
}

@proxyType()
export class TakeThatData {
    stuff: GiveMeData;
}

@generateProxy('/api/home/')
export class HomeApi extends Api {

    constructor(database: Database) {
        super(database);
    }

    @proxyMethod()
    private async getHomeDashboard(): Promise<TakeThatData> {
        // We ask the database to create a transaction for us that will return the
        // type TakeThatData. This allows us to return an object instead of having
        // to create temp parameters outside of the call to db.transaction and then
        // creating our return object from those.
        let response = await this.db.transaction<TakeThatData>(
            // This is the method that the db.transaction will call on our behalf.
            // db.transaction provides us with the transaction we will need in order
            // to access data in the database.
            // We specifically say that we are returning Promise<TakeThatData> here
            // so we can't mess up the return object and return things on it that
            // we didn't intend to. If this is left "empty" then we could do things
            // like add paramThree to the stuff object.
            async (tx: Transaction): Promise<TakeThatData> => {
                // We can forward our transaction to another method if we want and do querying there.
                // Or we can just query directly using the transaction if it is small and it makes sense.

                //let data = await this.getThingByID(tx, '341123-44323423-313123');
                //let whyUseMethod = await tx.query('no method needed, no transaction passing.');

                // We said we would return <TakeThatData> so we create our return object here and do so.
                return { stuff: { paramOne: 'data', paramTwo: 'whyUseMethod' } };
            }
        );

        // The response is an object of the type TakeThatData. That is what we wanted.
        return response;
    }

    private async getThingByID(tx: Transaction, thingID: string): Promise<any> {
        return await tx.query(`select * from thing where thingID = ${thingID}`);
    }

    @proxyMethod()
    private async giveMeData(payload: GiveMeData): Promise<GiveMeData> {
        await this.db.transaction(
            async (tx: Transaction) => {
                //console.log(await tx.query('Do things'));
            }
        );

        return {
            paramOne: 'I gave you new data',
            paramTwo: JSON.stringify(payload)
        }
    }
}

