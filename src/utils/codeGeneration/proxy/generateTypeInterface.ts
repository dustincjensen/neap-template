import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from '../generatedFile';

export class generateTypeInterface extends generatedFile {

    private FILE_PATH = './src/public/app/_service';
    private FILE_NAME = 'serviceProxy.generated.types.ts';

    constructor() {
        super();
        this._startFile();
    }

    /**
     * This will create an export interface in the proxyInterfaceFile.
     * @param symbol the class node that has the decorator proxyType
     */
    public add(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>): boolean {
        if (!this.hasDecorator(classDecorators, 'proxyType')) {
            return false;
        }

        this.file += this.tsnl(1, `export interface ${symbol.name} {`);

        // members represent the class variables.
        symbol.members.forEach(member => {
            let valDec = member.valueDeclaration as any;

            // Get the name
            // also if it has a question mark, include it for
            // optional-ness.
            let name = member.name;
            if (valDec.questionToken) {
                name += '?';
            }

            // check to see if it is a 
            // - complex type
            // - array type
            // - simple type
            let type = null;
            if (valDec.type.typeName) {
                // Complex type.
                type = valDec.type.typeName.text;
            } else if (ts.SyntaxKind[valDec.type.kind] === 'ArrayType' && valDec.type.elementType) {
                // Array type
                let element = valDec.type.elementType;
                type = element.typeName
                    ? `${element.typeName.text}[]`
                    : `${this.syntaxKindToString(ts.SyntaxKind[element.kind])}[]`;
            } else {
                // Simple type
                type = this.syntaxKindToString(ts.SyntaxKind[valDec.type.kind]);
            }

            // Add the property to the interface.
            this.file += this.tsnl(2, `${name}: ${type};`);
        });
        this.file += this.tsnl(1, '}');

        return true;
    }

    /**
     * Close the file and write the contents of 'this.file' to the specified location.
     */
    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync(path.join(this.FILE_PATH, this.FILE_NAME), this.file);
    }

    /**
     * Starts a module that will hold the interface types that are used
     * in the service proxy.
     */
    protected _startFile(): void {
        this.file = this.getGeneratedFileWarningHeader('typescript');
        this.file += this.tsnl(0, `export module ServiceProxyTypes {`);
    }

    /**
     * Close the ServiceProxyTypes export.
     */
    protected _closeFile(): void {
        this.file += this.tsnl(0, `}`);
    }
}