export class Default {
    public static DefaultLanguage = {
        Example: {
            Title: (count: number, greeting: string) => {
                return `Example Page ${count} ${greeting}`;
            }
        },
        Common: {
            UpdateButton: 'Update',
            DeleteButton: 'Delete' 
        }
    };
}