import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from '../generatedFile';

export class generateProxyModule extends generatedFile {

    private FILE_PATH = './src/public/app/_service';
    private FILE_NAME = 'serviceProxy.generated.module.ts';

    constructor() {
        super();
        this._startFile();
    }

    /**
     * Handles the adding of a new proxy class to the module.
     * @param obj the name of the proxy class
     */
    public add(proxyName: string): boolean {
        this.file += this.tsnl(2, `ServiceProxy.${proxyName},`);
        return true;
    }

    /**
     * Close and write the contents of 'this.file' to 
     * the specified location.
     */
    public writeFile(): void {
        this._closeFile();
        fs.writeFileSync(path.join(this.FILE_PATH, this.FILE_NAME), this.file);
    };

    /**
     * Adds the initial strings to the serviceProxy.generated.module.ts file.
     * These include the headers and the start of providers array that we will
     * add the proxyClass names to.
     */
    protected _startFile(): void {
        this.file = this.tsnl(0, `import { NgModule } from '@angular/core';`);
        this.file += this.tsnl(0, `import { ServiceProxy } from './serviceProxy.generated';`);
        this.file += this.tsnl(0, ``);
        this.file += this.tsnl(0, `@NgModule({`);
        this.file += this.tsnl(1, `providers: [`);
    };

    /**
     * Closes the export ServiceProxyModule by completing the @decorator
     * and creating the export class.
     */
    protected _closeFile(): void {
        this.file += this.tsnl(1, `]`);
        this.file += this.tsnl(0, `})`);
        this.file += this.tsnl(0, `export class ServiceProxyModule {}`);
    };
}