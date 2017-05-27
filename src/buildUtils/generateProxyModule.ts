import * as fs from 'fs';
import * as path from 'path';
import { generatedFile } from './generatedFile';

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
        this.file += `\t\tServiceProxy.${proxyName},\n`;
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