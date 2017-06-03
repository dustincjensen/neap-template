import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from './generatedFile';

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

        this.file += `\texport interface ${symbol.name} {\n`;

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

            // check to see if it is a complex type
            // or it is a simple type.
            let type = null;
            if (valDec.type.typeName) {
                type = valDec.type.typeName.text;
            } else {
                type = this.syntaxKindToString(ts.SyntaxKind[valDec.type.kind]);
            }

            // Add the property to the interface.
            this.file += `\t\t${name}: ${type};\n`;
        });
        this.file += '\t}\n';

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
        this.file = `export module ServiceProxyTypes {\n`;
    }

    /**
     * Close the ServiceProxyTypes export.
     */
    protected _closeFile(): void {
        this.file += `}`;
    }
}