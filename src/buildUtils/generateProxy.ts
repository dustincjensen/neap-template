import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

abstract class generatedFile {
    protected file: string;

    protected abstract _startFile(): void;
    protected abstract _closeFile(): void;
    public abstract writeFile(): void;
    public abstract add(obj: any, classDecorators?: ts.NodeArray<ts.Decorator>): boolean;

    /**
     * This will convert a SyntaxKind string into the simple type.
     * @param kind a string that is retrieved from ts.SyntaxKind[kind]
     */
    protected syntaxKindToString(kind: string): string {
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

    /**
     * This searches the list of decorators given to see if there 
     * exists a decorator with the decoratorType.
     * @param decorators the list of decorators to check.
     * @param decoratorType the type of decorator we are searching for.
     */
    protected hasDecorator(decorators: ts.NodeArray<ts.Decorator>, decoratorType: string): boolean {
        for (let i = 0; i < decorators.length; i++) {
            let expression = decorators[i].expression as any;
            if (expression.expression.getText() === decoratorType) {
                return true;
            }
        }
        return false;
    }

    /**
     * This searches the list of decorators just like _hasDecorator, but instead
     * of returning true if it exists, it returns the decoratorExpression.
     * @param decorators the list of decorators to check.
     * @param decoratorType the type of decorator we are searching for.
     */
    protected getDecoratorExpression(decorators: ts.NodeArray<ts.Decorator>, decoratorType: string): any {
        for (let i = 0; i < decorators.length; i++) {
            let expression = decorators[i].expression as any;
            if (expression.expression.getText() === decoratorType) {
                return expression;
            }
        }
        return undefined;
    }
}

interface proxyMethod {
    methodName: string;
    parameterListWithType: string;
    returnTypeKind: string;
    returnTypeArgument: string;
    parameterList: string;
    proxyRoute: string;
}

class generateServiceProxy extends generatedFile {

    constructor(private _proxyModuleFile: generateProxyModule) {
        super();
        this._startFile();
    }

    public add(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>): boolean {
        if (!this.hasDecorator(classDecorators, 'generateProxy')) {
            return false;
        }

        let proxyRouteExpression = this.getDecoratorExpression(classDecorators, 'generateProxy');
        let proxyRoute = proxyRouteExpression.arguments[0].text;
        let proxyName = this._createProxyName(symbol.name);
        let isFirstMethod = true;

        // loop over the exports of our class.
        // Exports = Static Method declarations on the class
        // Members = Object Methods on the class.
        symbol.members.forEach(exp => {

            // if we don't have any decorators then we can't have
            // the proxyMethod decorator, so it won't matter.
            let exportDecorators = exp && exp.valueDeclaration && exp.valueDeclaration.decorators || null;
            if (exportDecorators) {
                if (this.hasDecorator(exportDecorators, 'proxyMethod')) {

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
                        let kind = this.syntaxKindToString(ts.SyntaxKind[methodDetails.type.kind]);
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
                                let kind = this.syntaxKindToString(ts.SyntaxKind[methodDetails.type.typeArguments[0].kind]);
                                typeArgument = kind;
                            }
                        }
                    }

                    if (isFirstMethod) {
                        this._startProxyClass(proxyName);
                        this._proxyModuleFile.add(proxyName);
                        isFirstMethod = false;
                    } else {
                        this.file += '\n';
                    }

                    this._addInternalProxyContents({
                        methodName: exp.name,
                        parameterList: parameterList.join(','),
                        parameterListWithType: parameterListWithType.join(','),
                        proxyRoute: proxyRoute,
                        returnTypeKind: returnTypeKind,
                        returnTypeArgument: typeArgument
                    });

                }
            }
        });

        if (!isFirstMethod) {
            this._closeProxyClass();
        }
    }

    /**
     * Takes the API name and returns a new proxy name.
     * This method assumes that we name out Api classes
     * as following.
     *      {name}Api
     * So this function strips off the Api and appends Proxy.
     * @param apiName the name to convert to a proxy name.
     */
    private _createProxyName(apiName: string): string {
        if (apiName.indexOf('Api') >= 0) {
            return `${apiName.substr(0, apiName.indexOf('Api'))}Proxy`;
        } else {
            return `${apiName}Proxy`;
        }
    }



    /**
     * Creates an exported class inside of the ServiceProxy Module.
     * @param proxyName the name to use for the exported class.
     */
    private _startProxyClass(proxyName: string): void {
        this.file += `\t@Injectable()\n`;
        this.file += `\texport class ${proxyName} {\n`;
        this.file += `\t\tconstructor(private http: Http) {}\n\n`;
    }

    /**
     * Closes the export proxy class.
     */
    private _closeProxyClass(): void {
        this.file += `\t}\n\n`;
    }

    private _addInternalProxyContents(obj: proxyMethod): void {
        this.file += `\t\tpublic async ${obj.methodName}(${obj.parameterListWithType}): ${obj.returnTypeKind}<${obj.returnTypeArgument}> {\n`;
        // TODO This is technically wrong, because we can only have 1 body.
        this.file += `\t\t\tlet response = await this.http.post('${obj.proxyRoute}${obj.methodName}', ${obj.parameterList || undefined}).toPromise();\n`;
        this.file += `\t\t\tlet json = await response.json();\n`;
        this.file += `\t\t\treturn json.data as ${obj.returnTypeArgument};\n`;
        this.file += `\t\t}\n`;
    }

    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync('./src/public/app/_providers/serviceProxy.generated.ts', this.file);
    }

    /**
     * Adds the initial strings to the serviceProxy.generated.ts file.
     * These include the headers and the start of the ServiceProxy module export.
     */
    protected _startFile(): void {
        this.file = "import { Injectable } from '@angular/core';\n";
        this.file += "import { Http } from '@angular/http';\n";
        this.file += "import { Observable } from 'rxjs/Observable';\n";
        this.file += "import 'rxjs/add/operator/toPromise';\n";
        this.file += `import { ServiceProxyTypes } from '../_models/serviceProxyTypes.generated';\n`;
        this.file += "\n";
        this.file += "export module ServiceProxy {\n\n";
    }

    /**
     * Closes the export module ServiceProxy.
     */
    protected _closeFile(): void {
        this.file += '}\n';
    }
}

class generateProxyModule extends generatedFile {

    constructor() {
        super();
        this._startFile();
    }

    public add(obj: any): boolean {
        this.file += `\t\tServiceProxy.${obj},\n`;
        return true;
    }

    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync('./src/public/app/_providers/serviceProxy.generated.module.ts', this.file);
    };

    /**
     * Adds the initial strings to the serviceProxy.generated.module.ts file.
     * These include the headers and the start of providers array that we will
     * add the proxyClass names to.
     */
    protected _startFile(): void {
        this.file = `import { NgModule } from '@angular/core';\n`;
        this.file += `import { ServiceProxy } from './serviceProxy.generated';\n`;
        this.file += `\n`;
        this.file += `@NgModule({\n`;
        this.file += `\tproviders: [\n`;
    };

    /**
     * Closes the export ServiceProxyModule by completing the @decorator
     * and creating the export class.
     */
    protected _closeFile(): void {
        this.file += `\t]\n`;
        this.file += `})\n`;
        this.file += `export class ServiceProxyModule {}`;
    };
}

class generateTypeInterface extends generatedFile {

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
            let type = null;
            // check to see if it is a complex type
            // or it is a simple type.
            if (valDec.type.typeName) {
                type = valDec.type.typeName.text;
            } else {
                type = this.syntaxKindToString(ts.SyntaxKind[valDec.type.kind]);
            }
            this.file += `\t\t${member.name}: ${type};\n`;
        });
        this.file += '\t}\n';

        return true;
    }

    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync('./src/public/app/_models/serviceProxyTypes.generated.ts', this.file);
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

class generate {

    private _checker: ts.TypeChecker;
    private _proxyInterfaceFile: generateTypeInterface;
    private _proxyModuleFile: generateProxyModule;
    private _proxyFile: generateServiceProxy;

    constructor(folder: string, options: ts.CompilerOptions) {
        let fileNames = this._getFilesForFolderWithProperPath(folder);

        let program = ts.createProgram(fileNames, options);

        // Get the checker, we will use it to find more about classes
        this._checker = program.getTypeChecker();


        this._proxyInterfaceFile = new generateTypeInterface();
        this._proxyModuleFile = new generateProxyModule();
        this._proxyFile = new generateServiceProxy(this._proxyModuleFile);

        // Visit every sourceFile in the program    
        for (const sourceFile of program.getSourceFiles()) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, (node: ts.Node) => this._visit(node));
        }

        this._proxyFile.writeFile();
        this._proxyModuleFile.writeFile();
        this._proxyInterfaceFile.writeFile();
    }

    /**
     * Private function that returns the file names in the folder
     * if the folder exists. This will error if the folder does
     * not exists.
     * @param folder the folder to check for files.
     */
    private _getFilesForFolderWithProperPath(folder: string): string[] {
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
    private _visit(node: ts.Node) {
        // Only consider exported nodes
        if (!this._isNodeExported(node)) {
            console.log('Node was not exported');
            return;
        }

        // If the node is a class declaration we need to 
        // inspect it further.
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            this._handleClassNode(node);
        }
    }

    /**
     * This will get the class declaration node and see if it has
     * any decorators. We only care about classes with decorators.
     * @param node the class node.
     */
    private _handleClassNode(node: ts.Node) {
        // This is a top level class, get its symbol
        let symbol = this._checker.getSymbolAtLocation((<ts.ClassDeclaration>node).name);

        // Check to see if the class declaration has decorators.
        // If we don't have the decorators on this class
        // then we are moving on, because we don't care.
        let classDecorators = symbol && symbol.valueDeclaration && symbol.valueDeclaration.decorators || null;
        if (classDecorators) {
            if (!this._proxyFile.add(symbol, classDecorators)) {
                this._proxyInterfaceFile.add(symbol, classDecorators);
            }
        }
    }

    /** 
     * True if this is visible outside this file, false otherwise 
     */
    private _isNodeExported(node: ts.Node): boolean {
        return (node.flags & (ts.NodeFlags as any).Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }
}


new generate(process.argv[2], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});