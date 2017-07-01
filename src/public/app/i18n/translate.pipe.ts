import { Pipe, PipeTransform } from '@angular/core';
import { Translate } from './translate';

// TODO making the pipe impure makes it translate when switching languages.
// However this makes it get called ALOT.
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
    transform(value: string, parameter?: any): string {
        return Translate.translateString(value, parameter);
    }
}