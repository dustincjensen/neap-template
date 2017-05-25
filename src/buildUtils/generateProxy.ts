import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

/** 
 * Generate proxy searching files for decorator with @generateProxy()
 * with methods internally with the decorator @proxyMethod().
 */
function generateProxy(folder: string, options: ts.CompilerOptions): void {
    let fileNames = _getFilesForFolderWithProperPath(folder);

    let program = ts.createProgram(fileNames, options);

    // Get the checker, we will use it to find more about classes
    let checker = program.getTypeChecker();

    let isFirstMethod = true;
    let output: string = '';

    // Visit every sourceFile in the program    
    for (const sourceFile of program.getSourceFiles()) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, _visit);
    }

    if (!isFirstMethod) {
        _closeFile();
    }

    // print out the doc
    fs.writeFileSync('./src/public/app/_providers/serviceProxy.generated.ts', output);

    return;

    /**
     * Private function that returns the file names in the folder
     * if the folder exists. This will error if the folder does
     * not exists.
     * @param folder the folder to check for files.
     */
    function _getFilesForFolderWithProperPath(folder: string): string[] {
        // check to see if the folder exists
        if (!fs.existsSync(folder)) {
            throw Error(`Folder does not exist: ${folder}`);
        }

        // get the list of file names.
        // if the folder is empty we throw an error.
        let fileNames = fs.readdirSync(folder);
        if (!fileNames) {
            throw Error(`Empty folder: ${folder}`);
        }

        // modify the list of file names to have the path
        // from the folder included in them.
        fileNames.forEach((fileName, index) => {
            fileNames[index] = path.join(folder, fileName);
        });

        // return the file names.
        return fileNames;
    }

    /**
     * Visit nodes finding exported classes.
     * @param node the node to explore.
     */
    function _visit(node: ts.Node) {
        // Only consider exported nodes
        if (!isNodeExported(node)) {
            return;
        }

        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            _handleClassNode(node);
        }
        else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            // This is a namespace, visit its children
            ts.forEachChild(node, _visit);
        }
    }

    function _handleClassNode(node: ts.Node) {
        // This is a top level class, get its symbol
        let symbol = checker.getSymbolAtLocation((<ts.ClassDeclaration>node).name);

        // Check to see if the class declaration has decorators.
        let classDecorators = symbol && symbol.valueDeclaration && symbol.valueDeclaration.decorators || null;
        if (classDecorators) {
            // if we don't have the decorator generateProxy on this class
            // then we are moving on, because we don't care.
            if (!_hasDecorator(classDecorators, 'generateProxy')) {
                return;
            }

            let proxyRouteExpression = _getDecoratorContent(classDecorators, 'generateProxy');
            let proxyRoute = proxyRouteExpression.arguments[0].text;


            // loop over the exports of our class.
            symbol.exports.forEach(exp => {
                // if we don't have any decorators then we can't have
                // the proxyMethod decorator, so it won't matter.
                let exportDecorators = exp && exp.valueDeclaration && exp.valueDeclaration.decorators || null;
                if (exportDecorators) {
                    if (_hasDecorator(exportDecorators, 'proxyMethod')) {
                        console.log(exp.name);

                        if (isFirstMethod) {
                            _pushBaseFileContents();
                            isFirstMethod = false;
                        } else {
                            output += '\n';
                        }

                        output += `\tpublic async ${exp.name}(): Promise<any> {\n`;
                        output += `\t\tlet response = await this.http.get('${proxyRoute}${exp.name}').toPromise();\n`;
                        output += `\t\treturn response.json();\n`;
                        output += `\t}\n`;
                    }
                }
            });
        }
    }

    function _hasDecorator(decorators: ts.NodeArray<ts.Decorator>, decoratorType: string): boolean {
        for (let i = 0; i < decorators.length; i++) {
            let decorator = decorators[i];
            if ((decorator.expression as any).expression.text === decoratorType) {
                return true;
            }
        }
        return false;
    }

    function _getDecoratorContent(decorators: ts.NodeArray<ts.Decorator>, decoratorType: string): any {
        for (let i = 0; i < decorators.length; i++) {
            let decorator = decorators[i];
            if ((decorator.expression as any).expression.text === decoratorType) {
                return decorator.expression;
            }
        }
        return undefined;
    }

    function _pushBaseFileContents(): void {
        output += "import { Injectable } from '@angular/core';\n";
        output += "import { Http } from '@angular/http';\n";
        output += "import { Observable } from 'rxjs/Observable';\n";
        output += "import 'rxjs/add/operator/toPromise';\n";
        output += "\n";
        output += "@Injectable()\n";
        output += "export class ServiceProxy {\n";
        output += "\tconstructor(public http: Http) {}\n\n";
    }

    function _closeFile(): void {
        output += '}\n';
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (node.flags & (ts.NodeFlags as any).Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }
}

generateProxy(process.argv[2], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});