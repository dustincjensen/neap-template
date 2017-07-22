import { Language } from '../language';

/**
 * NOTE: Translated using Google Translate
 */
export let French: Language = {
    Languages: {
        English: 'Anglais',
        French: 'français'
    },
    Example: {
        Title: (count: number, greeting: string) => {
            return `Exemple de page ${count} ${greeting}`;
        }
    },
    Common: {
        UpdateButton: 'Mettre à jour',
        DeleteButton: 'Effacer'
    }
}