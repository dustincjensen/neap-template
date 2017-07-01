import { Language } from '../language';

export class English extends Language {
    constructor() {
        super();
        this.locale = 'en';
        this.dictionary = {
            EXAMPLE: {
                TITLE: 'Example Page {{ count }} {{ other }}'
            },
            COMMON: {
                'UPDATE-BUTTON': 'Update',
                'DELETE-BUTTON': 'Delete'
            }
        }
    }
}