import { NgModule } from '@angular/core';
import { Translate } from './translate';
import { TranslateService } from './translate.service';

import { English } from './languages/en';
import { French } from './languages/fr';

@NgModule({
    providers: [TranslateService]
})
export class TranslateModule {
    constructor() {
        let supportedLanguages = [
            English, French
        ];
        let languagePref = localStorage.getItem('languagePref');

        Translate.initialize(!languagePref || languagePref === 'en' 
            ? English : French, supportedLanguages);
    }
}
