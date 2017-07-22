import { NgModule } from '@angular/core';
import { Translate } from './translate';
import { TranslateService } from './translate.service';

import { Language } from './language';
import { DefaultLanguage } from './languages/default';
import { English } from './languages/en';
import { French } from './languages/fr';

@NgModule({
    providers: [TranslateService]
})
export class TranslateModule {
    constructor() {
        // We load our supported languages here and give them their
        // string codes ('en', 'fr') etc for the language they represent.
        let supportedLanguages: {[locale: string]: Language} = {
            'default': DefaultLanguage,
            'en': English,
            'fr': French
        };
        Translate.initialize(supportedLanguages);
    }
}