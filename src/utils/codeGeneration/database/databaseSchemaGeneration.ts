import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from '../generate';
import { generateCreateTable } from './generateCreateTable';
import { generateCRUD } from './generateCRUD';

class databaseSchemaGeneration extends generate {

    private _generateCreateTable: generateCreateTable;
    private _generateCRUD: generateCRUD;

    constructor(folder: string, options: ts.CompilerOptions) {
        super(folder, options);
    }

    protected setupGenerationFiles() {
        this._generateCreateTable = new generateCreateTable();
        this._generateCRUD = new generateCRUD();
    }

    protected handleClassWithDecorators(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>) {
        this._generateCreateTable.add(symbol, classDecorators);
        this._generateCRUD.add(symbol, classDecorators);
    }

    protected finish() {
        // _generateCreateTable finishes the files itself.        
        this._generateCRUD.writeFile();
    }
}

// Generate the files.
new databaseSchemaGeneration(process.argv[2], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});