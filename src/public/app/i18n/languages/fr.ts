import { Language } from '../language';

/**
 * NOTE: Translated using Google Translate
 */
export class French extends Language {
    constructor() {
        super();
        this.locale = 'fr';
        this.dictionary = {
            EXAMPLE: {
                TITLE: 'Exemple de page {{ count }} {{ other }}'
            },
            COMMON: {
                'UPDATE-BUTTON': 'Mettre à jour',
                'DELETE-BUTTON': 'Effacer'
            }
        }
    }
}