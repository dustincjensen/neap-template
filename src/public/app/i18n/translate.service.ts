import { Injectable } from '@angular/core';
import { Translate } from './translate';

@Injectable()
export class TranslateService {
    translate(value: string, parameter?: any): string {
        return Translate.translateString(value, parameter);
    }
    switchLanguage(localeString: string): void {
        Translate.switchLanguage(localeString);
    }
}