import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from '../generate';
import { generateCreateTable } from './generateCreateTable';
import { generateCRUD } from './generateCRUD';
import { generateTestData } from './generateTestData';

class databaseSchemaGeneration extends generate {

    private _generateCreateTable: generateCreateTable;
    private _generateCRUD: generateCRUD;
    private _generateTestData: generateTestData;

    constructor(folder: string, options: ts.CompilerOptions) {
        super(folder, options);
    }

    protected setupGenerationFiles() {
        this._generateCreateTable = new generateCreateTable();
        this._generateCRUD = new generateCRUD();
        this._generateTestData = new generateTestData();
    }

    protected handleClassWithDecorators(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>) {
        this._generateCreateTable.add(symbol, classDecorators);
        this._generateCRUD.add(symbol, classDecorators);
        this._generateTestData.add(symbol, classDecorators);
    }

    protected finish() {
        // _generateCreateTable finishes the files itself.
        this._generateCRUD.writeFile();
        // _generateTestData finishes the files itself.
    }
}

// Generate the files.
new databaseSchemaGeneration(process.argv[2], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});