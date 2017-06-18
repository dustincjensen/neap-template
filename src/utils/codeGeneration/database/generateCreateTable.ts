import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from '../generatedFile';

export class generateCreateTable extends generatedFile {

    private FILE_PATH = './src/db/_schema/';
    private FILE_NAME = '.generated.sql';
    private TABLE_DECORATOR = 'table';
    private PRIMARY_KEY_DECORATOR = 'primaryKey';
    private FOREIGN_KEY_DECORATOR = 'foreignKey';
    private REQUIRED_DECORATOR = 'required';
    private RANGE_DECORATOR = 'range';

    private _isFirstColumn: boolean;
    private _currentTableName: string;

    constructor() {
        super();
    }

    /**
     * Starts the file.
     */
    protected _startFile(): void {
        this.file = `create table ${this._currentTableName} (\n`;
    }

    /**
     * Closes the file.
     */
    protected _closeFile(): void {
        this.file += '\n);\n';
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
        if (!this.hasDecorator(classDecorators, this.TABLE_DECORATOR)) {
            return false;
        }

        // We have the name of the table go head start the file.
        this._isFirstColumn = true;
        this._currentTableName = symbol.name;
        this._startFile();

        let constraints = [];
        let foreignKeyConstraints = [];

        // loop over the exports of our class.
        // Exports = Static Method declarations on the class
        // Members = Object Methods on the class.
        symbol.members.forEach(exp => {
            let valDec = (exp.valueDeclaration as any);
            let propertyName = exp.name;
            let propertyType = this.syntaxKindToString(ts.SyntaxKind[valDec.type.kind]);
            let isPrimaryKey = false;
            let isRequired = false;

            // If we have decorators on the member, go through them and see
            // if the list contains the decorators. If it does, then we set the
            // appropriate variables for use later.
            let decorators = valDec && valDec.decorators || null;
            if (decorators) {
                isPrimaryKey = this.hasDecorator(decorators, this.PRIMARY_KEY_DECORATOR);
                isRequired = this.hasDecorator(decorators, this.REQUIRED_DECORATOR);
                this._handleRangeDecorator(decorators, propertyName, constraints);
                this._handleForeignKeyDecorators(decorators, propertyName, foreignKeyConstraints);
            }

            // Convert the Typescript type to a database type then add the column.
            propertyType = this._convertTypescriptTypeToDatabaseType(propertyType, isPrimaryKey)
            this._addColumn(propertyName, propertyType, isPrimaryKey, isRequired);
        });

        this._writeConstraintsToFile(foreignKeyConstraints, constraints);
        this.writeFile();
    }

    /**
     * Takes a string and returns it with double quotes around it.
     * @param propertyName the string to put double quotes around.
     */
    private _quote(propertyName: string): string {
        return `"${propertyName}"`;
    }

    /**
     * Checks for the RANGE decorator. If it has it, we get the contents of the decorator
     * and create a constraint and push it to the list of constraints.
     * @param decorators the decorators to check.
     * @param propertyName the property name that has the range decorator.
     * @param constraints the list of existing constraints.
     */
    private _handleRangeDecorator(
        decorators: ts.NodeArray<ts.Decorator>, propertyName: string, constraints: string[]
    ) {
        if (this.hasDecorator(decorators, this.RANGE_DECORATOR)) {
            let rangeExpression = this.getDecoratorExpression(decorators, this.RANGE_DECORATOR);
            let lowerLimit = rangeExpression.arguments[0].text;
            let upperLimit = rangeExpression.arguments[1].text;

            let check = `\tconstraint range check (\n`;
            check += `\t\t${this._quote(propertyName)} >= ${lowerLimit} and ${this._quote(propertyName)} <= ${upperLimit})`

            constraints.push(check);
        }
    }

    /**
     * Checks for the FOREIGN KEY decorator. If it has it, we get the contents of the decorator
     * and create a foreign key constraint and push it to the list of foreign keys.
     * @param decorators the decorators to check.
     * @param propertyName the property name that has the range decorator.
     * @param foreignKeyConstraints the list of existing foreign keys.
     */
    private _handleForeignKeyDecorators(
        decorators: ts.NodeArray<ts.Decorator>, propertyName: string, foreignKeyConstraints: string[]
    ) {
        if (this.hasDecorator(decorators, this.FOREIGN_KEY_DECORATOR)) {
            let foreignExpression = this.getDecoratorExpression(decorators, this.FOREIGN_KEY_DECORATOR);
            let foreignTable = foreignExpression.arguments[0].text;

            // By default the foreign column will match the property name you already have
            // if you didn't specify it. If you did specify it, then it will be read from the
            // second argument of the decorator.
            let foreignColumn = propertyName;
            if (foreignExpression.arguments.length == 2) {
                foreignColumn = foreignExpression.arguments[1].text;
            }

            let foreignKey = `\tconstraint ${this._currentTableName}_${propertyName}_${foreignTable}_${foreignColumn}_fk foreign key (${this._quote(propertyName)}) references ${foreignTable} ("${foreignColumn}")`;
            foreignKeyConstraints.push(foreignKey);
        }
    }

    /**
     * Takes the information gathered and writes to the file a new column.
     * @param propertyName the name of the column to add.
     * @param propertyType the type of the column to add.
     * @param isPrimaryKey if the column is a primary key.
     * @param isRequired if the column should be nullable.
     */
    private _addColumn(
        propertyName: string, propertyType: string,
        isPrimaryKey: boolean, isRequired: boolean
    ) {
        // If we are required, then we need to specify
        // not null, otherwise we will be explicit
        // and say that the column can be null.
        let nullable = isRequired ? 'not null' : 'null';

        // If this is the first column that has been written
        // to the file, then we don't need to add the comma.
        // After the first column, we do.
        if (!this._isFirstColumn) {
            this.file += ',\n';
        } else {
            this._isFirstColumn = false;
        }
        this.file += `\t${this._quote(propertyName)} ${propertyType} ${nullable}`;

        // If the column is a primary key then we additionally add a constraint
        // based on the table name to say that it is part of the primary key.
        if (isPrimaryKey) {
            this.file += ` constraint ${this._currentTableName}_pkey primary key`;
        }
    }

    /**
     * Takes the foreign key and constraints and writes them to the file.
     * @param foreignKeyConstraints the foreign keys.
     * @param constraints the constraints.
     */
    private _writeConstraintsToFile(foreignKeyConstraints: string[], constraints: string[]): void {
        for (let i = 0; i < foreignKeyConstraints.length; i++) {
            this.file += `,\n`;
            this.file += `${foreignKeyConstraints[i]}`;
        }

        for (let i = 0; i < constraints.length; i++) {
            this.file += `,\n`;
            this.file += `${constraints[i]}`;
        }
    }

    /**
     * Returns a type for the database based on the Typescript type.
     * @param propertyType the Typescript property type.
     * @param isPrimaryKey whether this field is a primary key.
     */
    private _convertTypescriptTypeToDatabaseType(propertyType: string, isPrimaryKey: boolean): string {
        if (isPrimaryKey) {
            return 'bigserial';
        }

        switch (propertyType) {
            case 'boolean': return 'boolean';
            case 'number': return 'int';
            case 'string': return 'varchar';
            default:
                return 'NOT_HANDLED';
        }
    }

}