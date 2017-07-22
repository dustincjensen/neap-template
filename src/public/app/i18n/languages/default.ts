export let DefaultLanguage = {
    Languages: {
        English: 'English',
        French: 'French'
    },
    Example: {
        Title: (count: number, greeting: string) => {
            return `Example Page ${count} ${greeting}`;
        },
        CakeQuestion: 'Do you want cake?',
        IceCreamQuestion: 'How about ice cream?'
    },
    Common: {
        Name: 'Name',
        Year: 'Year',
        Description: 'Description',

        NameRequired: 'You must provide a name.',
        YearMustBeBetween: (year: number, maxYear: number) => {
            return `You must provide a year between ${year} and ${maxYear}.`;
        },
        StringMaxLength: (maxLength: number) => {
            return `The maximum length that is allowed is ${maxLength}.`;
        },

        GenericWarning: 'We have a problem and this is the warning.',
        NoRecordsToShow: 'No Records to Show',

        NewButton: 'New',
        UpdateButton: 'Update',
        DeleteButton: 'Delete',
        SubmitButton: 'Submit',
        CancelButton: 'Cancel'
    }
};