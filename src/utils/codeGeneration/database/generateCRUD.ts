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
        this.file = this.tsnl(0, `import { Common } from './queries.common.crud';`);
        this.file += this.tsnl(0, ``);
        this.file += this.tsnl(0, `export module CRUD {`);
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
        this.file += this.tsnl(2, `let tableName: string = '${currentTableName}';`);
        this.file += this.tsnl(2, `let primaryKey: string = '${primaryKey}';`);
        this.file += this.tsnl(2, `let insertColumns: string[] = [${propertyList.map(v => `'${v}'`).join(', ')}];`);
        this.file += this._createModule(2);
        this.file += this._readModule(2);
        this.file += this._updateModule(2);
        this.file += this._deleteModule(2);
        this.file += `\t}\n`;
    }

    private _createModule(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export module Create {`);
        str += this._singleInsert(tabs + 1);
        str += this._multipleInsert(tabs + 1);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _singleInsert(tabs: number): string {

        let str = '';
        str += this.tsnl(tabs, `export function Single(): string {`);
        str += this.tsnl(tabs + 1, `return Common.Create.Single(tableName, insertColumns);`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _multipleInsert(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export function Multiple(count: number): string {`);
        str += this.tsnl(tabs + 1, `return Common.Create.Multiple(tableName, insertColumns, count);`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _readModule(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export module Read {`);
        str += this._selectAll(tabs + 1);
        str += this._selectWherePrimaryKey(tabs + 1);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _selectAll(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export function All(columns?: string[]): string {`);
        str += this.tsnl(tabs + 1, `return Common.Read.All(tableName, columns);`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _selectWherePrimaryKey(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export function WherePrimaryKey(columns?: string[]): string {`);
        str += this.tsnl(tabs + 1, `return Common.Read.WherePrimaryKey(tableName, primaryKey, columns);`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _updateModule(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export module Update {`);
        str += this._updateWherePrimaryKey(tabs + 1);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _updateWherePrimaryKey(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export function WherePrimaryKey(columns: string[]): string {`);
        str += this.tsnl(tabs + 1, `return Common.Update.WherePrimaryKey(tableName, primaryKey, columns);`);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _deleteModule(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export module Delete {`);
        str += this._deleteWherePrimaryKey(tabs + 1);
        str += this.tsnl(tabs, `}`);
        return str;
    }

    private _deleteWherePrimaryKey(tabs: number): string {
        let str = '';
        str += this.tsnl(tabs, `export function WherePrimaryKey(): string {`);
        str += this.tsnl(tabs + 1, `return Common.Delete.WherePrimaryKey(tableName, primaryKey);`);
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