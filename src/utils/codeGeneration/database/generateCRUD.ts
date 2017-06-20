import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from '../generatedFile';

export class generateCRUD extends generatedFile {

    private FILE_PATH = './src/db/queries/';
    private FILE_NAME = 'queries.generated.crud.ts';
    private TABLE_DECORATOR = 'table';
    private PRIMARY_KEY_DECORATOR = 'primaryKey';

    constructor() {
        super();
        this._startFile();
    }

    /**
     * Starts the file.
     */
    protected _startFile(): void {
        this.file = `export module CRUD {\n`;
    }

    /**
     * Closes the file.
     */
    protected _closeFile(): void {
        this.file += `}\n`;
    }

    /**
     * Closes the file and writes the contents of 'this.file' to the specified location.
     */
    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync(path.join(this.FILE_PATH, this.FILE_NAME), this.file);
    }

    /**
     * This will return true if it creates a table on the symbol.
     * False if it doesn't contain the decorator 'generateProxy'.
     * @param symbol the class definition
     * @param classDecorators the decorators on the class
     */
    public add(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>): boolean {
        // If the class decorators do not contain the table decorator, then we
        // will return false because we didn't do anything with the data.
        if (!this.hasDecorator(classDecorators, this.TABLE_DECORATOR)) {
            return false;
        }

        let currentTableName = symbol.name;
        let propertyList: string[] = [];
        let primaryKey: string;

        // loop over the exports of our class.
        // Exports = Static Method declarations on the class
        // Members = Object Methods on the class.
        symbol.members.forEach(exp => {
            let valDec = (exp.valueDeclaration as any);
            let propertyName = exp.name;

            // If we have decorators on the member, go through them and see
            // if the list contains the decorators. If it does, then we set the
            // appropriate variables for use later.
            let decorators = valDec && valDec.decorators || null;
            if (decorators && this.hasDecorator(decorators, this.PRIMARY_KEY_DECORATOR)) {
                primaryKey = this._quote(propertyName);
            } else {
                propertyList.push(this._quote(propertyName));
            }
        });

        this.file += `\texport module ${currentTableName} {\n`;
        this.file += this._createModule(2, currentTableName, propertyList);
        this.file += this._readModule(2, currentTableName, primaryKey);
        this.file += this._updateModule(2, currentTableName, primaryKey);
        this.file += this._deleteModule(2, currentTableName, primaryKey);
        this.file += `\t}\n`;
    }

    private _createModule(tabs: number, tableName: string, propertyList: string[]): string {
        let str = '';
        str += this.tsnl(tabs, `export module Create {`);
        str += this._singleInsert(tabs + 1, tableName, propertyList);
        str += this._multipleInsert(tabs + 1, tableName, propertyList);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _singleInsert(tabs: number, tableName: string, propertyList: string[]): string {
        let parameters: string[] = [];
        for (let i = 0; i < propertyList.length; i++) {
            parameters.push(`$${i + 1}`);
        }

        let str = '';
        str += this.tsnl(tabs, `export function Single(): string {`);
        str += this.tsnl(tabs + 1, `return \`INSERT INTO ${tableName} (${propertyList.join(', ')}) VALUES (${parameters.join(', ')}) RETURNING *;\`;`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _multipleInsert(tabs: number, tableName: string, propertyList: string[]): string {
        let str = '';
        str += this.tsnl(tabs, `export function Multiple(count: number): string {`);
        str += this.tsnl(tabs + 1, `let insertStatement = \`INSERT INTO ${tableName} (${propertyList.join(', ')}) VALUES \`;`);
        str += this.tsnl(tabs + 1, `let values: string[] = [];`);
        str += this.tsnl(tabs + 1, `let numberOfParameters = ${propertyList.length};`);
        str += this.tsnl(tabs + 1, `for (let i = 1; i <= numberOfParameters * count;) {`);
        str += this.tsnl(tabs + 2, `let group: string[] = [];`);
        str += this.tsnl(tabs + 2, `for (let j = 0; j < numberOfParameters; j++) {`);
        str += this.tsnl(tabs + 3, `group.push(\`$\${i++}\`);`);
        str += this.tsnl(tabs + 2, `}`);        
        str += this.tsnl(tabs + 2, `values.push(\`(\${group.join(', ')})\`);`);
        str += this.tsnl(tabs + 1, `}`);
        str += this.tsnl(tabs + 1, `insertStatement += \`\${values.join(',')} RETURNING *;\`;`);
        str += this.tsnl(tabs + 1, `return insertStatement;`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _readModule(tabs: number, tableName: string, primaryKey: string): string {
        let str = '';
        str += this.tsnl(tabs, `export module Read {`);
        str += this._selectAll(tabs + 1, tableName);
        str += this._selectWherePrimaryKey(tabs + 1, tableName, primaryKey);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _selectAll(tabs: number, tableName: string): string {
        let str = '';
        str += this.tsnl(tabs, `export function All(columns?: string[]): string {`);
        str += this.tsnl(tabs + 1, `let selectColumns = '*';`);
        str += this.tsnl(tabs + 1, `if (columns) { selectColumns = columns.join(','); }`);
        str += this.tsnl(tabs + 1, `return \`SELECT \${selectColumns} FROM ${tableName};\`;`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _selectWherePrimaryKey(tabs: number, tableName: string, primaryKey: string): string {
        let str = '';
        str += this.tsnl(tabs, `export function WherePrimaryKey(columns?: string[]): string {`);
        str += this.tsnl(tabs + 1, `let selectColumns = '*';`);
        str += this.tsnl(tabs + 1, `if (columns) { selectColumns = columns.join(','); }`);
        str += this.tsnl(tabs + 1, `return \`SELECT \${selectColumns} FROM ${tableName} WHERE ${primaryKey} = $1;\`;`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _updateModule(tabs: number, tableName: string, primaryKey: string): string {
        let str = '';
        str += this.tsnl(tabs, `export module Update {`);
        str += this._updateWherePrimaryKey(tabs + 1, tableName, primaryKey);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _updateWherePrimaryKey(tabs: number, tableName: string, primaryKey: string): string {
        let str = '';
        str += this.tsnl(tabs, `export function WherePrimaryKey(columns: string[]): string {`);
        str += this.tsnl(tabs + 1, `let updateStatement = \`UPDATE ${tableName} SET \`;`);
        str += this.tsnl(tabs + 1, `let parameters: string[] = [];`);
        str += this.tsnl(tabs + 1, `let i = 0;`);
        str += this.tsnl(tabs + 1, `for (; i < columns.length; i++) {`);
        str += this.tsnl(tabs + 2, `parameters.push(\`\${columns[i]} = $\${i + 1}\`);`);
        str += this.tsnl(tabs + 1, `}`);
        str += this.tsnl(tabs + 1, `updateStatement += \`\${parameters.join(',')} \`;`);
        str += this.tsnl(tabs + 1, `updateStatement += \`WHERE ${primaryKey} = $\${i + 1};\`;`);
        str += this.tsnl(tabs + 1, `return updateStatement;`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _deleteModule(tabs: number, tableName: string, primaryKey: string): string {
        let str = '';
        str += this.tsnl(tabs, `export module Delete {`);
        str += this._deleteAll(tabs + 1, tableName);
        str += this._deleteWherePrimaryKey(tabs + 1, tableName, primaryKey);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _deleteAll(tabs: number, tableName: string): string {
        let str = '';
        str += this.tsnl(tabs, `export function All(): string {`);
        str += this.tsnl(tabs + 1, `return \`DELETE FROM ${tableName};\`;`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _deleteWherePrimaryKey(tabs: number, tableName: string, primaryKey: string): string {
        let str = '';
        str += this.tsnl(tabs, `export function WherePrimaryKey(): string {`);
        str += this.tsnl(tabs + 1, `return \`DELETE FROM ${tableName} WHERE ${primaryKey} = $1;\`;`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    /**
     * Takes a string and returns it with double quotes around it.
     * @param propertyName the string to put double quotes around.
     */
    private _quote(propertyName: string): string {
        return `"${propertyName}"`;
    }
}