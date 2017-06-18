import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from '../generate';
import { generateCreateTable } from './generateCreateTable';

class databaseSchemaGeneration extends generate {

    private _generateCreateTable: generateCreateTable;

    constructor(folder: string, options: ts.CompilerOptions) {
        super(folder, options);
    }

    protected setupGenerationFiles() {
        this._generateCreateTable = new generateCreateTable();
    }

    protected handleClassWithDecorators(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>) {
        this._generateCreateTable.add(symbol, classDecorators);
    }

    protected finish() {
        // _generateCreateTable finishes the files itself.
        // So we don't need to do anything here.
    }
}

// Generate the files.
new databaseSchemaGeneration(process.argv[2], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});