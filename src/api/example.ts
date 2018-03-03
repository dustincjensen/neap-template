import { Api } from './api';
import { Database, Transaction } from '../db/database';
import { Queries } from '../db/queries/_export';
import { Models } from '../db/models/_export';
import { proxyType, generateProxy, proxyMethod, database, requestBody } from './proxyDecorators';

@proxyType()
export class Example {
    exampleID?: number;
    name: string;
    description: string;
    year: number;
}

@generateProxy('/api/example/')
export class ExampleApi extends Api {

    @proxyMethod()
    private async getExamples(
        @database() db: Database
    ): Promise<Example[]> {
        // We ask the database to create a transaction for us that will return the
        // type Example[]. This allows us to return an object instead of having
        // to create temporary parameters outside of the call to db.transaction and 
        // then creating our return object from those.
        return await db.transaction(
            // This is the method that the db.transaction will call on our behalf.
            // db.transaction provides us with the transaction we will need in order
            // to access data in the database.
            async tx => {
                // We can forward our transaction to another method if we want and do querying there.
                // Or we can just query directly using the transaction if it is small and it makes sense.
                return tx.query<Example>(Queries.CRUD.Example.Read.All());
            }
        );
    }

    @proxyMethod()
    private async createExample(
        @requestBody() example: Example,
        @database() db: Database  
    ): Promise<number> {
        return await db.transaction(async tx => {
            let added = await tx.querySingle<Example>(
                Queries.CRUD.Example.Create.Single(),
                [example.name, example.description, example.year]
            );
            return added.exampleID;
        });
    }

    @proxyMethod()
    private async deleteExample(
        @database() db: Database, 
        @requestBody() exampleID: number
    ): Promise<void> {
        await db.transaction(async tx => {
            await tx.query(Queries.CRUD.Example.Delete.WherePrimaryKey(), [exampleID]);
        });
    }
}

