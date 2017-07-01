import { Language } from './language';

export class Translate {
    private static _supportedLanguages: Language[];
    private static _dictionary: Object;

    public static initialize(baseLanguage: Language, languages: Language[]): void {
        Translate._supportedLanguages = languages;
        Translate._dictionary = baseLanguage.dictionary;
    }

    public static switchLanguage(localeString: string): void {
        let filteredLanguage = Translate._supportedLanguages.filter((lang: Language) => {
            return lang.locale === localeString;
        });

        if (filteredLanguage.length > 1) {
            throw new Error('More than one language matched the locale.');
        }

        if (filteredLanguage.length === 0) {
            throw new Error('No language matched the locale.');
        }

        // localStorage.setItem('languagePref', localeString);
        // window.location.reload();

        Translate._dictionary = filteredLanguage[0].dictionary;
    }

    public static translateString(value: string, parameter?: any): string {
        let valueArray = value.split('.');
        let lookUp = Translate.lookUp(valueArray);
        for (let key in parameter) {
            let regex = new RegExp('{{\\s*' + Translate.regexEscape(key) + '\\s*}}', 'gi');
            lookUp = lookUp.replace(regex, parameter[key]);
        }
        return lookUp;
    }

    private static regexEscape(value: string): string {
        return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    }

    private static lookUp(valueArray: string[]): string {
        let lookUp: Object = this._dictionary[valueArray[0]];
        for (let i = 1; i < valueArray.length; i++) {
            lookUp = lookUp[valueArray[i]];
        }
        return lookUp as string;
    }
}