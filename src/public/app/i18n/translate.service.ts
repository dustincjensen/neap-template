import { Injectable } from '@angular/core';
import { Translate } from './translate';
import { Language } from './language';

@Injectable()
export class TranslateService  {
    constructor() {}

    public get dictionary(): Language {
        return Translate.dictionary;
    }
}