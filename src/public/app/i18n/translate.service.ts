import { Injectable } from '@angular/core';
import { Translate } from './translate';
import { Language } from './language';

@Injectable()
export class TranslateService  {
    constructor() {}

    /**
     * The dictionary for accessing the strings.
     */
    public get dictionary(): Language {
        return Translate.dictionary;
    }

    /**
     * Method to switch what language we want displayed.
     * @param locale 2 letter code of the language to display.
     */
    public switchLanguage(locale: string): void {
        Translate.switchLanguage(locale);
    }
}