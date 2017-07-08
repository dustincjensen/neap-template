interface TranslationContract {
    COMMON: COMMON;
}

interface COMMON {
    'UPDATE-BUTTON': string;
    'DELETE-BUTTON': string;
}


let defaultLang = {
    thing1: "Thing 1",
    thing2: "Thing 2",
    hierarchy: {
        subthing: "Yep"
    }
};

type language = {
    [P in keyof typeof defaultLang]: typeof defaultLang[P];
};

let english = defaultLang as language;

let french: language = {
    thing1: "Chose 1",
    thing2: "Chose 2",
    hierarchy: {
        subthing: "Oui"
    }
};

let handle = _generateLanguageHandles(english);
function _generateLanguageHandles<T>(src: T, prefix?: string): T {
    let returnValue = {} as any;
    prefix = prefix || "";
    for (let key in src) {
        if (typeof src[key] === "string") {
            returnValue[key] = key;
        }
        else {
            returnValue[key] = _generateLanguageHandles(src[key], key + ".");
        }
    }
    return returnValue;
}

handle.hierarchy.subthing

// <Tag>Here is some { () => swearWord } content, { () => otherSwearword }!!! <b>So...</b> Booya!</Tag>

// Here is some {0} content, {1}!!!