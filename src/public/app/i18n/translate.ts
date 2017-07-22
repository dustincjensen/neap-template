import { Language } from './language';

export class Translate {
    private static _supportedLanguages: Language[];
    private static _dictionary: Object;
    private static _translateHandle: Language;

    public static initialize(baseLanguage: Language, languages: Language[]): void {
        Translate._supportedLanguages = languages;
        Translate._translateHandle = Translate._generateLanguageHandles(baseLanguage);
    }

    public static switchLanguage(localeString: string): void {
        // let filteredLanguage = Translate._supportedLanguages.filter((lang: Language) => {
        //     return lang.locale === localeString;
        // });

        // if (filteredLanguage.length > 1) {
        //     throw new Error('More than one language matched the locale.');
        // }

        // if (filteredLanguage.length === 0) {
        //     throw new Error('No language matched the locale.');
        // }

        // localStorage.setItem('languagePref', localeString);
        // window.location.reload();

        //Translate._dictionary = filteredLanguage[0].dictionary;
    }

    public static get dictionary(): Language {
        return Translate._translateHandle;
    }

    private static _generateLanguageHandles<T>(src: T, prefix?: string): T {
        let returnValue = {} as any;
        prefix = prefix || '';
        for (let key in src) {
            if (typeof src[key] === 'object') {
                returnValue[key] = Translate._generateLanguageHandles(src[key], key + '.');
            } else {
                returnValue[key] = src[key];
            }
        }
        return returnValue;
    }
}