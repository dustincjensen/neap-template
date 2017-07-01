import { NgModule } from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TranslateService } from './translate.service';
import { Translate } from './translate';

import { English } from './languages/en';
import { French } from './languages/fr';

@NgModule({
    providers: [TranslateService],
    declarations: [TranslatePipe],
    exports: [TranslatePipe]
})
export class TranslateModule {
    constructor() {
        let english = new English();
        let french = new French();
        let supportedLanguages = [english, french];

        let languagePref = localStorage.getItem('languagePref');

        Translate.initialize(languagePref === 'en' ? english : french, supportedLanguages);
    }
}
