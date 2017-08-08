/**
 * By declaring global, we can add type definitions
 * to the already existing interfaces such the String
 * prototype.
 */
declare global {
    interface String {
        format(arg1: any, ...args: any[]): string;
    }
}

/**
 * This is a static class that initializes all of the new
 * prototype methods that will be used on the server.
 */
export class Extensions {

    public static initialize(): void {
        Extensions._defineNewStringMethods();
    }

    private static _defineNewStringMethods(): void {
        /**
         * Usage: 'Hello, {0}.'.format('Bob');
         * Returns: 'Hello, Bob.'
         */
        Object.defineProperty(String.prototype, 'format', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: function () {
                let args = arguments;
                return this.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != 'undefined'
                        ? args[number] : match;
                });
            }
        });
    }
}