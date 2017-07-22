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
        },
        CakeQuestion: 'Voulez-vous du gâteau?',
        IceCreamQuestion: 'Qu\'en est-il de la glace?'
    },
    Common: {
        Name: 'le nom',
        Year: 'An',
        Description: 'La description',

        NameRequired: 'Vous devez fournir un nom.',
        YearMustBeBetween: (year: number, maxYear: number) => {
            return `Vous devez fournir un an entre ${year} et ${maxYear}.`;
        },
        StringMaxLength: (maxLength: number) => {
            return `La longueur maximale autorisée est de ${maxLength}.`;
        },

        GenericWarning: 'Nous avons un problème et c\'est l\'avertissement.',
        NoRecordsToShow: 'Aucun enregistrement à afficher',

        NewButton: 'Nouveau',
        UpdateButton: 'Mettre à jour',
        DeleteButton: 'Effacer',
        SubmitButton: 'Soumettre',
        CancelButton: 'Annuler'
    }
}