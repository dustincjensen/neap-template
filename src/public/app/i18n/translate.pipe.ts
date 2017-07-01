import { Pipe, PipeTransform } from '@angular/core';
import { Translate } from './translate';

@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
    transform(value: string, parameter?: any): string {
        return Translate.translateString(value, parameter);
    }
}