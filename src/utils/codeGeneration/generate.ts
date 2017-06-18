import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export abstract class generate {

    private _checker: ts.TypeChecker;
    private _sourceFiles: ts.SourceFile[];

    constructor(folder: string, options: ts.CompilerOptions) {
        // Get the list of file names
        // Then create a typescript program.
        // Finally get the checker, we will use it to find more about the classes.
        let fileNames = this._getFilesForFolderWithProperPath(folder);
        let program = ts.createProgram(fileNames, options);
        this._checker = program.getTypeChecker();
        this._sourceFiles = program.getSourceFiles();

        // Tell the children to set up.
        this.setupGenerationFiles();

        // Start walking the source files.
        this._walkSourceFiles();

        // Let the children write their files
        this.finish();
    }

    protected abstract setupGenerationFiles();
    protected abstract handleClassWithDecorators(symbol: ts.Symbol, classDecorators: ts.NodeArray<ts.Decorator>);
    protected abstract finish();

    /**
     * Looks at the _sourceFiles variable and goes through each
     * visiting the child nodes and looking for class decorators.
     */
    private _walkSourceFiles() {
        // Visit every sourceFile in the program 
        // and walk the tree to search for classes.
        for (const sourceFile of this._sourceFiles) {
            ts.forEachChild(sourceFile, (node: ts.Node) => this._visit(node));
        }
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
            return;
        }

        // If the node is a class declaration we need to 
        // inspect it further. Otherwise we are done with this node.
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
            this.handleClassWithDecorators(symbol, classDecorators);
        }
    }

    /** 
     * True if this is visible outside this file, false otherwise 
     */
    private _isNodeExported(node: ts.Node): boolean {
        return (node.flags & (ts.NodeFlags as any).Export) !== 0 || (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
    }
}