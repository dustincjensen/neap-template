import * as ts from "typescript";

export abstract class generatedFile {
    protected file: string;

    // These are methods that the implementing class
    // must override. These make the basis for creating a file.
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

    /**
     * Supports creating a file header for either 
     * .sql file or .ts files.
     * @param type sql or typescript
     */
    protected getGeneratedFileWarningHeader(type: string, extraMessages?: string[]): string {
        let headerMessages = [
            'WARNING!',
            'This is an AUTO GENERATED FILE.',
            'Any changes made to this file will be lost on a recompile.'
        ];

        if (extraMessages) {
            headerMessages.push('');
            for (let i = 0; i < extraMessages.length; i++)
                headerMessages.push(extraMessages[i]);
        }

        switch (type) {
            case 'sql':
                let sqlHeader = '';
                headerMessages.forEach(msg => {
                    sqlHeader += `-- ${msg}\r\n`;
                });
                return sqlHeader;
            case 'typescript':
                let typescriptHeader = '/*\r\n';
                headerMessages.forEach(msg => {
                    typescriptHeader += ` * ${msg}\r\n`;
                });
                typescriptHeader += ' */\r\n';
                return typescriptHeader;
            default:
                return null;
        }
    }

    /**
     * Prepend's the string with tabs, based on the count.
     * Appends to the end of the string, a new line character.
     * @param count the number of tabs to add.
     * @param str the string to add the tabs and new line to.
     */
    protected tsnl(count: number, str: string): string {
        return `${this._repeat('\t', count)}${str}\n`;
    }

    /**
     * Helper method to create a string of count length, all of
     * the char string.
     * eg) \t\t\t\t\t\t 
     * @param char the character string to repeat.
     * @param count the number of times to repeat it.
     */
    private _repeat(char: string, count: number): string {
        let array: string[] = [];
        for (let i = 0; i < count; i++) {
            array[i] = char;
        }
        return array.join('');
    }
}