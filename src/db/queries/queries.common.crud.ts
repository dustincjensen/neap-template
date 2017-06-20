/**
 * These are the common CRUD operations.
 * So that the modules for each Model are smaller and
 * more succinct, we reference these. It has the advantage
 * that the common CRUD operations can exist here and if
 * they need to be modified, model CRUD doesn't need to be
 * regenerated.
 * 
 * NOTE: This should not be used by anything other than the 
 *       queries.generated.crud.
 */
export module Common {

    export class Create {
        /**
         * Single will insert a single record into the table.
         * @param tableName the table to insert into.
         * @param columns the columns that will be filled with data.
         */
        public static Single(tableName: string, columns: string[]): string {			
            let values: string[] = [];
            let numberOfParameters = columns.length;
            for (let i = 1; i <= numberOfParameters;) {
                values.push(`$${i++}`);
            }
            return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')}) RETURNING *;`;
        }

        /**
         * Multiple will insert multiple records into the table.
         * @param tableName the table to insert into.
         * @param columns the columns that will be filled with data.
         * @param count the number of records we are inserting.
         */
        public static Multiple(tableName: string, columns: string[], count: number): string {
            let insertStatement = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES `;
            let values: string[] = [];
            let numberOfParameters = columns.length;
            for (let i = 1; i <= numberOfParameters * count;) {
                let group:string[] = [];
                for (let j=0; j<numberOfParameters; j++) {
                    group.push(`$${i++}`);
                }
                values.push(`(${group.join(', ')})`);
            }
            insertStatement += `${values.join(', ')} RETURNING *;`;
            return insertStatement;
        }
    }

    export class Read {
        /**
         * All will read all of the records from the table.
         * @param tableName the table to read from.
         * @param columns the columns that should be selected.
         */
        public static All(tableName: string, columns?: string[]): string {
            let selectColumns = '*';
            if (columns) { selectColumns = columns.join(','); }
            return `SELECT ${selectColumns} FROM ${tableName};`;
        }

        /**
         * WherePrimaryKey will read the record from the table that matches the primary key.
         * @param tableName the table to read from.
         * @param primaryKey the primary key to match.
         * @param columns the columns that should be selected.
         */
        public static WherePrimaryKey(tableName: string, primaryKey: string, columns?: string[]): string {
            let selectColumns = '*';
            if (columns) { selectColumns = columns.join(','); }
            return `SELECT ${selectColumns} FROM ${tableName} WHERE ${primaryKey} = $1;`;
        }
    }

    export class Update {
        /**
         * WherePrimaryKey will update the record in the table that matches the primary key.
         * @param tableName the table to update.
         * @param primaryKey the primary key to match.
         * @param columns the columns that should be updated.
         */
        public static WherePrimaryKey(tableName: string, primaryKey: string, columns: string[]): string {
            let updateStatement = `UPDATE ${tableName} SET `;
            let parameters: string[] = [];
            let i = 0;
            for (; i < columns.length; i++) {
                parameters.push(`${columns[i]} = $${i + 1}`);
            }
            updateStatement += `${parameters.join(',')} `;
            updateStatement += `WHERE ${primaryKey} = $${i + 1};`;
            return updateStatement;
        }
    }

    export class Delete {
        /**
         * WherePrimaryKey will delete only the record that matches the primary key.
         * @param tableName the table to delete the record from.
         * @param primaryKey the primary key to match.
         */
        public static WherePrimaryKey(tableName: string, primaryKey: string): string {
            return `DELETE FROM ${tableName} WHERE ${primaryKey} = $1;`;
        }
    }		
}