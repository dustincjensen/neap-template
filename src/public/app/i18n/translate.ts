import { Language } from './language';

export class Translate {
    private static LOCAL_STORAGE_LANGUAGE_PREF = 'languagePref';
    private static _supportedLanguages: { [locale: string]: Language };
    private static _translateHandle: Language;

    /**
     * Called by translate.module to setup the language service.
     * @param languages the list of supported languages.
     */
    public static initialize(languages: { [locale: string]: Language }): void {
        Translate._supportedLanguages = languages;
        Translate._translateHandle = Translate._generateLanguageHandles(
            Translate._getBaseLanguage());
    }

    /**
     * Method to check for the supported language, set it as our local storage
     * preference. Then we reload the window on behalf of the user.
     * @param locale the language to switch to.
     */
    public static switchLanguage(locale: string): void {
        Translate._getSupportedLanguage(locale);
        localStorage.setItem(Translate.LOCAL_STORAGE_LANGUAGE_PREF, locale);
        window.location.reload();
    }

    /**
     * Access to the string dictionary.
     */
    public static get dictionary(): Language {
        return Translate._translateHandle;
    }

    /**
     * This will attempt to get a language out of the supported languages object.
     * If the langauge does not exist, we throw an error.
     * @param locale the language to find.
     */
    private static _getSupportedLanguage(locale: string): Language {
        let selectedLanguage = Translate._supportedLanguages[locale];
        if (!selectedLanguage) {
            throw new Error('No language matched the locale.');
        }
        return selectedLanguage;
    }

    /**
     * Gets the default language to display, by asking local storage for it's preference.
     * If there is no preference, or that preference is not supported we will default
     * to the default language.
     */
    private static _getBaseLanguage(): Language {
        let languagePref = localStorage.getItem(Translate.LOCAL_STORAGE_LANGUAGE_PREF);
        let baseLanguage: Language;
        try {
            if (languagePref) {
                baseLanguage = Translate._getSupportedLanguage(languagePref);
            } else {
                localStorage.setItem(Translate.LOCAL_STORAGE_LANGUAGE_PREF, 'default');
                throw new Error('No Language Pref.');
            }
        }
        catch (ex) {
            baseLanguage = Translate._getSupportedLanguage('default');
        }
        return baseLanguage;
    }

    /**
     * This method creates the dot syntax for accessing a language to reach the node.
     * Therefore each language can have Typescript compile time checking to make sure
     * that the value actually exists in the language.
     * Eg) Common.Buttons.Delete would return 'Delete' for English.
     * @param src the language source.
     * @param prefix possible prefix to the node path.
     */
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