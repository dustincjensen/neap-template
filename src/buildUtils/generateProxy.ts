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
    let proxyInterfaceFile: string = '';
    _startModule();
    _startProxyModuleFile();
    _startProxyInterfaceFile();

    // Visit every sourceFile in the program    
    for (const sourceFile of program.getSourceFiles()) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, _visit);
    }

    _closeModule();
    _closeProxyModuleFile();
    _closeProxyInterfaceFile();

    // print out the doc
    fs.writeFileSync('./src/public/app/_providers/serviceProxy.generated.ts', proxyFile);
    fs.writeFileSync('./src/public/app/_providers/serviceProxy.generated.module.ts', proxyModuleFile);
    fs.writeFileSync('./src/public/app/_models/serviceProxyTypes.generated.ts', proxyInterfaceFile);

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
    }

    function _handleClassNode(node: ts.Node) {
        // This is a top level class, get its symbol
        let symbol = checker.getSymbolAtLocation((<ts.ClassDeclaration>node).name);

        // Check to see if the class declaration has decorators.
        let classDecorators = symbol && symbol.valueDeclaration && symbol.valueDeclaration.decorators || null;
        if (classDecorators) {
            // if we don't have the decorators on this class
            // then we are moving on, because we don't care.
            let generateProxyDecorator = _hasDecorator(classDecorators, 'generateProxy');
            let proxyTypeDecorator = _hasDecorator(classDecorators, 'proxyType');
            if (!generateProxyDecorator && !proxyTypeDecorator) {
                return;
            }

            if (generateProxyDecorator) {
                _handleGenerateProxyClass(symbol, classDecorators);
            } else {
                _handleGenerateTypeInterface(symbol);
            }
        }
    }

    function _handleGenerateTypeInterface(symbol: ts.Symbol): void {
        proxyInterfaceFile += `\texport interface ${symbol.name} {\n`;
        symbol.members.forEach(member => {

            let valDec = member.valueDeclaration as any;

            let type = null;
            if (valDec.type.typeName) {
                type = valDec.type.typeName.text;
            } else {
                type = _returnSyntaxKindProperString(ts.SyntaxKind[valDec.type.kind]);
            }

            proxyInterfaceFile += `\t\t${member.name}: ${type};\n`;
        });
        proxyInterfaceFile += '\t}\n';
    }

    function _handleGenerateProxyClass(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>): void {
        let proxyRouteExpression = _getDecoratorContent(classDecorators, 'generateProxy');
        let proxyRoute = proxyRouteExpression.arguments[0].text;
        let proxyName = _createProxyName(symbol.name);
        let isFirstMethod = true;

        // loop over the exports of our class.
        // Exports = Static Method declarations on the class
        // Members = Object Methods on the class.
        symbol.members.forEach(exp => {

            // if we don't have any decorators then we can't have
            // the proxyMethod decorator, so it won't matter.
            let exportDecorators = exp && exp.valueDeclaration && exp.valueDeclaration.decorators || null;
            if (exportDecorators) {
                if (_hasDecorator(exportDecorators, 'proxyMethod')) {

                    // get parameters
                    let parameterListWithType = [];
                    let parameterList = [];
                    let methodDetails = exp.valueDeclaration as any;
                    methodDetails.parameters.forEach(param => {
                        // TODO no support for basic types?
                        let newParameter = `${param.name.text}: ServiceProxyTypes.${param.type.typeName.text}`;
                        parameterListWithType.push(newParameter);
                        parameterList.push(param.name.text);
                        // console.log('Name', param.name.text);
                        // console.log('Type', param.type.typeName.text);
                    });

                    // TODO Get Return Type
                    // This will throw an error on type being undefined if you do not
                    // explicitly state the return type of your @proxyMethod.
                    // This is by design.
                    let returnTypeKind = null;
                    if (methodDetails.type.typeName) {
                        returnTypeKind = methodDetails.type.typeName.text;
                    }
                    else {
                        // My API requires promised methods, so I don't think this will ever
                        // be hit.
                        let kind = _returnSyntaxKindProperString(ts.SyntaxKind[methodDetails.type.kind]);
                        returnTypeKind = kind;
                    }

                    let typeArgument = 'void';
                    if (methodDetails.type.typeArguments) {
                        if (methodDetails.type.typeArguments[0]) {
                            // Complex
                            if (methodDetails.type.typeArguments[0].typeName) {
                                typeArgument = `ServiceProxyTypes.${methodDetails.type.typeArguments[0].typeName.text}`;
                            }
                            // Simple type
                            else {
                                let kind = _returnSyntaxKindProperString(ts.SyntaxKind[methodDetails.type.typeArguments[0].kind]);
                                typeArgument = kind;
                            }
                        }
                    }

                    if (isFirstMethod) {
                        _startProxyClass(proxyName);
                        proxyModuleFile += `\t\tServiceProxy.${proxyName},\n`;
                        isFirstMethod = false;
                    } else {
                        proxyFile += '\n';
                    }

                    proxyFile += `\t\tpublic async ${exp.name}(${parameterListWithType.join(',')}): ${returnTypeKind}<${typeArgument}> {\n`;
                    // TODO This is technically wrong, because we can only have 1 body.
                    proxyFile += `\t\t\tlet response = await this.http.post('${proxyRoute}${exp.name}', ${parameterList.join(',') || undefined}).toPromise();\n`;
                    proxyFile += `\t\t\tlet json = await response.json();\n`;
                    proxyFile += `\t\t\treturn json.data as ${typeArgument};\n`;
                    proxyFile += `\t\t}\n`;

                    //console.log('\n\n');
                }
            }
        });

        if (!isFirstMethod) {
            _closeProxyClass();
        }
    }

    function _returnSyntaxKindProperString(kind: string): string {
        switch (kind) {
            case 'VoidKeyword': return 'void';
            case 'BooleanKeyword': return 'boolean';
            case 'NumberKeyword': return 'number';
            case 'StringKeyword': return 'string';
            case 'AnyKeyword': return 'any';
            default:
                return 'any';
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
        proxyFile += `\t\tconstructor(private http: Http) {}\n\n`;
    }

    function _closeProxyClass(): void {
        proxyFile += `\t}\n\n`;
    }

    function _startModule(): void {
        proxyFile += "import { Injectable } from '@angular/core';\n";
        proxyFile += "import { Http } from '@angular/http';\n";
        proxyFile += "import { Observable } from 'rxjs/Observable';\n";
        proxyFile += "import 'rxjs/add/operator/toPromise';\n";
        proxyFile += `import { ServiceProxyTypes } from '../_models/serviceProxyTypes.generated';\n`;
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

    function _startProxyInterfaceFile(): void {
        proxyInterfaceFile += `export module ServiceProxyTypes {\n`;
    }

    function _closeProxyInterfaceFile(): void {
        proxyInterfaceFile += `}`;
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