import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from '../generatedFile';

// TODO comment better
export class generateTestData extends generatedFile {

    private FILE_PATH = './src/db/_testData/';
    private FILE_NAME = '.generated.sql';
    private TEST_DATA_DECORATOR = 'testData';

    private _currentTableName: string;

    constructor() {
        super();
    }

    /**
     * Starts the file.
     */
    protected _startFile(): void {
        this.file = `insert into ${this._currentTableName} (`;
    }

    /**
     * Closes the file.
     */
    protected _closeFile(): void {
    }

    /**
     * Closes the file and writes the contents of 'this.file' to the specified location.
     */
    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync(path.join(this.FILE_PATH, this._currentTableName + this.FILE_NAME), this.file);
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
        if (!this.hasDecorator(classDecorators, this.TEST_DATA_DECORATOR)) {
            return false;
        }

        // We have the name of the table go head start the file.
        this._currentTableName = symbol.name;
        this._startFile();

        // Get the contents of the testData decorator.
        let testDataExpression = this.getDecoratorExpression(classDecorators, this.TEST_DATA_DECORATOR);

        // We know it has to have 1 argument and 1 argument only.
        // That is an array of objects.
        let elements = testDataExpression.arguments[0].elements;
        let firstObject = true;
        let firstAdd = true;
        let writeableData = [];

        elements.forEach(exp => {
            let props = exp.properties;
            let obj = {};
            props.forEach(prop => {
                // prop.name.text
                // prop.initializer.text                
                if (firstObject) {
                    this._addValue(this._quote(prop.name.text), firstAdd);
                    firstAdd = false;
                }
                obj[prop.name.text] = prop.initializer.text;
            });
            writeableData.push(obj);
            firstObject = false;
        });

        this.file += this.tsnl(0, `) values `);
        for (let i = 0; i < writeableData.length; i++) {
            let record = writeableData[i];
            let str = '';
            let first = true;
            for (let key in record) {
                str += `${first ? '' : ','}${this._escapeSingleQuotes(record[key])}`;
                first = false;
            }
            this.file += this.tsnl(1, `(${str})${i < writeableData.length - 1 ? ',' : ';'}`);
        }

        this.writeFile();
    }

    private _addValue(name: string, firstAdd: boolean) {
        this.file += `${firstAdd ? '' : ','}${name}`;
    }

    /**
     * Takes a string and returns it with double quotes around it.
     * @param propertyName the string to put double quotes around.
     */
    private _quote(propertyName: string): string {
        return `"${propertyName}"`;
    }

    private _escapeSingleQuotes(propertyValue: string): string {
        // This is the escape for Postgresql.
        // You double up the single quotes '' 
        return `'${propertyValue.replace(/'/g, "''")}'`;
    }
}