import { Injectable } from '@angular/core';
import { Translate } from './translate';

@Injectable()
export class TranslateService extends Function {
    constructor() {
        super('...args', 'return this._func(...args)');
        return this.bind(this);
    }

    private _func(value: string, parameter?: any): string {
        return Translate.translateString(value, parameter);
    }
}