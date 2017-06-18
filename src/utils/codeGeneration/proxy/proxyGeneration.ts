import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generate } from '../generate';
import { generateTypeInterface } from './generateTypeInterface';
import { generateProxyModule } from './generateProxyModule';
import { generateServiceProxy } from './generateServiceProxy';

class proxyGeneration extends generate {

    private _proxyInterfaceFile: generateTypeInterface;
    private _proxyModuleFile: generateProxyModule;
    private _proxyFile: generateServiceProxy;

    constructor(folder: string, options: ts.CompilerOptions) {
        super(folder, options);
    }

    protected setupGenerationFiles() {
        // Create the classes that will handle the creation
        // of the 3 files that we want to generate.
        this._proxyInterfaceFile = new generateTypeInterface();
        this._proxyModuleFile = new generateProxyModule();
        this._proxyFile = new generateServiceProxy(this._proxyModuleFile);
    }

    protected handleClassWithDecorators(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>) {
        // Give it to the proxy file, it will return false if
        // the decorator it wants is not in the list.
        if (!this._proxyFile.add(symbol, classDecorators)) {
            this._proxyInterfaceFile.add(symbol, classDecorators);
        }
    }

    protected finish() {
        // Write each of the files.        
        this._proxyFile.writeFile();
        this._proxyModuleFile.writeFile();
        this._proxyInterfaceFile.writeFile();
    }
}

// Generate the files.
new proxyGeneration(process.argv[2], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});