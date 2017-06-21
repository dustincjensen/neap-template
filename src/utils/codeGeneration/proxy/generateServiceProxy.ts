import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from '../generatedFile';
import { generateProxyModule } from './generateProxyModule';

// This is a helper interface to define what
// the object should look like when it is created from
// the add method and put into the module.
interface proxyMethod {
    methodName: string;
    parameter: string;
    parameterWithType: string;
    returnTypeKind: string;
    returnTypeArgument: string;
    proxyRoute: string;
}

export class generateServiceProxy extends generatedFile {

    private FILE_PATH = './src/public/app/_service';
    private FILE_NAME = 'serviceProxy.generated.ts';
    private GENERATE_PROXY_DECORATOR = 'generateProxy';
    private PROXY_METHOD_DECORATOR = 'proxyMethod';

    constructor(private _proxyModuleFile: generateProxyModule) {
        super();
        this._startFile();
    }

    /**
     * This will return true if it creates a proxy based on the symbol.
     * False if it doesn't contain the decorator 'generateProxy'.
     * @param symbol the class definition
     * @param classDecorators the decorators on the class
     */
    public add(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>): boolean {
        if (!this.hasDecorator(classDecorators, this.GENERATE_PROXY_DECORATOR)) {
            return false;
        }

        // Get the proxy route and name.
        let proxyRouteExpression = this.getDecoratorExpression(classDecorators, this.GENERATE_PROXY_DECORATOR);
        let proxyRoute = proxyRouteExpression.arguments[0].text;
        let proxyName = this._createProxyName(symbol.name);

        // Start the proxy class and the proxy to the module.
        this._startProxyClass(proxyName);
        this._proxyModuleFile.add(proxyName);

        // loop over the exports of our class.
        // Exports = Static Method declarations on the class
        // Members = Object Methods on the class.
        symbol.members.forEach(exp => {

            // if we don't have any decorators then we can't have
            // the proxyMethod decorator, so it won't matter.
            let exportDecorators = exp && exp.valueDeclaration && exp.valueDeclaration.decorators || null;
            if (exportDecorators) {
                if (this.hasDecorator(exportDecorators, this.PROXY_METHOD_DECORATOR)) {

                    // get parameters
                    let parameterWithType = '';
                    let parameter = '';
                    let methodDetails = exp.valueDeclaration as any;
                    methodDetails.parameters.forEach(param => {
                        // We now support basic types like number and string as
                        // well as our proxy defined classes. We do this by wrapping
                        // our calls up to the server in a json object that it unwraps
                        // when it gets the call.
                        let newParameter = `${param.name.text}: ${param.type.typeName
                            ? `ServiceProxyTypes.${param.type.typeName.text}`
                            : `${this.syntaxKindToString(ts.SyntaxKind[param.type.kind])}`
                            }`;
                        parameterWithType = newParameter;
                        parameter = param.name.text;
                    });

                    // Get Return Type
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

                    // Add the method to the proxy definition.
                    this._addInternalProxyContents({
                        methodName: exp.name,
                        parameter: parameter,
                        parameterWithType: parameterWithType,
                        proxyRoute: proxyRoute,
                        returnTypeKind: returnTypeKind,
                        returnTypeArgument: typeArgument
                    });

                }
            }
        });

        // Close the proxy class
        this._closeProxyClass();
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
        this.file += this.tsnl(1, `@Injectable()`);
        this.file += this.tsnl(1, `export class ${proxyName} {`);
        this.file += this.tsnl(2, `constructor(private http: Http) {}`);
    }

    /**
     * Closes the export proxy class.
     */
    private _closeProxyClass(): void {
        this.file += this.tsnl(1, `}`);
    }

    /**
     * This will add a method to the proxy for the client.
     * @param obj the parameters to fill out the method declaration for the proxy.
     */
    private _addInternalProxyContents(obj: proxyMethod): void {
        this.file += this.tsnl(2, `public async ${obj.methodName}(${obj.parameterWithType}): ${obj.returnTypeKind}<${obj.returnTypeArgument}> {`);
        this.file += this.tsnl(3, `let response = await this.http.post('${obj.proxyRoute}${obj.methodName}', { data: ${obj.parameter || undefined} }).toPromise();`);
        this.file += this.tsnl(3, `let json = await response.json();`);
        this.file += this.tsnl(3, `return json.data as ${obj.returnTypeArgument};`);
        this.file += this.tsnl(2, `}`);
    }

    /**
     * Closes the file and writes the contents of 'this.file' to the specified location.
     */
    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync(path.join(this.FILE_PATH, this.FILE_NAME), this.file);
    }

    /**
     * Adds the initial strings to the serviceProxy.generated.ts file.
     * These include the headers and the start of the ServiceProxy module export.
     */
    protected _startFile(): void {
        this.file = this.tsnl(0, "import { Injectable } from '@angular/core';");
        this.file += this.tsnl(0, "import { Http } from '@angular/http';");
        this.file += this.tsnl(0, "import { Observable } from 'rxjs/Observable';");
        this.file += this.tsnl(0, "import 'rxjs/add/operator/toPromise';");
        this.file += this.tsnl(0, `import { ServiceProxyTypes } from './serviceProxy.generated.types';`);
        this.file += this.tsnl(0, "");
        this.file += this.tsnl(0, "export module ServiceProxy {");
    }

    /**
     * Closes the export module ServiceProxy.
     */
    protected _closeFile(): void {
        this.file += this.tsnl(0, '}');
    }
}