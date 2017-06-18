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
     * This will return true if it creates a table on the symbol.
     * False if it doesn't contain the decorator 'generateProxy'.
     * @param symbol the class definition
     * @param classDecorators the decorators on the class
     */
    public add(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>): boolean {
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
            let quotedPropertyName = `"${exp.name}"`;
            let propertyType = this.syntaxKindToString(
                ts.SyntaxKind[valDec.type.kind]);
            let isPrimaryKey = false;
            let isRequired = false;


            let exportDecorators = exp && exp.valueDeclaration && exp.valueDeclaration.decorators || null;
            if (exportDecorators) {
                if (this.hasDecorator(exportDecorators, this.PRIMARY_KEY_DECORATOR)) {
                    isPrimaryKey = true;
                }

                if (this.hasDecorator(exportDecorators, this.REQUIRED_DECORATOR)) {
                    isRequired = true;
                }

                if (this.hasDecorator(exportDecorators, this.RANGE_DECORATOR)) {
                    // Get the proxy route and name.
                    let rangeExpression = this.getDecoratorExpression(exportDecorators, this.RANGE_DECORATOR);
                    let lowerLimit = rangeExpression.arguments[0].text;
                    let upperLimit = rangeExpression.arguments[1].text;

                    let check = `\tconstraint range check (\n`;
                    check += `\t\t${quotedPropertyName} >= ${lowerLimit} and ${quotedPropertyName} <= ${upperLimit})`

                    constraints.push(check);
                }

                if (this.hasDecorator(exportDecorators, this.FOREIGN_KEY_DECORATOR)) {
                    let foreignExpression = this.getDecoratorExpression(exportDecorators, this.FOREIGN_KEY_DECORATOR);
                    let foreignTable = foreignExpression.arguments[0].text;

                    // By default the foreign column will match the property name you already have
                    // if you didn't specify it. If you did specify it, then it will be read from the
                    // second argument of the decorator.
                    let foreignColumn = propertyName;
                    if (foreignExpression.arguments.length == 2) {
                        foreignColumn = foreignExpression.arguments[1].text;
                    }

                    let foreignKey = `\tconstraint ${this._currentTableName}_${propertyName}_${foreignTable}_${foreignColumn}_fk foreign key (${quotedPropertyName}) references ${foreignTable} ("${foreignColumn}")`;
                    foreignKeyConstraints.push(foreignKey);
                }
            }

            propertyType = this._convertTypescriptTypeToDatabaseType(propertyType, isPrimaryKey)
            this._addColumn(quotedPropertyName, propertyType, isPrimaryKey, isRequired);


        });

        for (let i = 0; i < foreignKeyConstraints.length; i++) {
            this.file += `,\n`;
            this.file += `${foreignKeyConstraints[i]}`;
        }

        for (let i = 0; i < constraints.length; i++) {
            this.file += `,\n`;
            this.file += `${constraints[i]}`;
        }

        this.writeFile();
    }


    /**
     * Closes the file and writes the contents of 'this.file' to the specified location.
     */
    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync(path.join(this.FILE_PATH, this._currentTableName + this.FILE_NAME), this.file);
    }

    protected _startFile(): void {
        this.file = `create table ${this._currentTableName} (\n`;
    }

    private _addColumn(
        propertyName: string, propertyType: string,
        isPrimaryKey: boolean, isRequired: boolean
    ) {
        let nullable = isRequired ? 'not null' : 'null';

        if (!this._isFirstColumn) {
            this.file += ',\n';
        }
        this.file += `\t${propertyName} ${propertyType} ${nullable}`;

        if (isPrimaryKey) {
            this.file += ` constraint ${this._currentTableName}_pkey primary key`;
        }

        this._isFirstColumn = false;
    }

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

    protected _closeFile(): void {
        this.file += '\n);\n';
    }
}