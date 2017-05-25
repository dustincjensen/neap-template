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


    let proxyFile: string = '';
    let proxyModuleFile: string = '';
    _startModule();
    _startProxyModuleFile();

    // Visit every sourceFile in the program    
    for (const sourceFile of program.getSourceFiles()) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, _visit);
    }

    _closeModule();
    _closeProxyModuleFile();

    // print out the doc
    fs.writeFileSync('./src/public/app/_providers/serviceProxy.generated.ts', proxyFile);
    fs.writeFileSync('./src/public/app/_providers/serviceProxy.generated.module.ts', proxyModuleFile);

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
            let proxyName = _createProxyName(symbol.name);
            let isFirstMethod = true;

            // loop over the exports of our class.
            symbol.exports.forEach(exp => {
                // if we don't have any decorators then we can't have
                // the proxyMethod decorator, so it won't matter.
                let exportDecorators = exp && exp.valueDeclaration && exp.valueDeclaration.decorators || null;
                if (exportDecorators) {
                    if (_hasDecorator(exportDecorators, 'proxyMethod')) {

                        if (isFirstMethod) {
                            _startProxyClass(proxyName);
                            proxyModuleFile += `\t\tServiceProxy.${proxyName},\n`;
                            isFirstMethod = false;
                        } else {
                            proxyFile += '\n';
                        }

                        proxyFile += `\t\tpublic async ${exp.name}(): Promise<any> {\n`;
                        proxyFile += `\t\t\tlet response = await this.http.get('${proxyRoute}${exp.name}').toPromise();\n`;
                        proxyFile += `\t\t\treturn response.json();\n`;
                        proxyFile += `\t\t}\n`;
                    }
                }
            });

            if (!isFirstMethod) {
                _closeProxyClass();
            }
        }
    }

    function _createProxyName(apiName: string): string {
        if (apiName.indexOf('Api') >= 0) {
            return `${apiName.substr(0, apiName.indexOf('Api'))}Proxy`;
        } else {
            return `${apiName}Proxy`;
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

    function _startProxyClass(proxyName: string): void {
        proxyFile += `\t@Injectable()\n`;
        proxyFile += `\texport class ${proxyName} {\n`;
        proxyFile += `\t\tconstructor(public http: Http) {}\n\n`;
    }

    function _closeProxyClass(): void {
        proxyFile += `\t}\n\n`;
    }

    function _startModule(): void {
        proxyFile += "import { Injectable } from '@angular/core';\n";
        proxyFile += "import { Http } from '@angular/http';\n";
        proxyFile += "import { Observable } from 'rxjs/Observable';\n";
        proxyFile += "import 'rxjs/add/operator/toPromise';\n";
        proxyFile += "\n";
        proxyFile += "export module ServiceProxy {\n\n";
    }

    function _closeModule(): void {
        proxyFile += '}\n';
    }

    function _startProxyModuleFile(): void {
        proxyModuleFile += `import { NgModule } from '@angular/core';\n`;
        proxyModuleFile += `import { ServiceProxy } from './serviceProxy.generated';\n`;
        proxyModuleFile += `\n`;
        proxyModuleFile += `@NgModule({\n`;
        proxyModuleFile += `\tproviders: [\n`;
    }

    function _closeProxyModuleFile(): void {
        proxyModuleFile += `\t]\n`;
        proxyModuleFile += `})\n`;
        proxyModuleFile += `export class ServiceProxyModule {}`;
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