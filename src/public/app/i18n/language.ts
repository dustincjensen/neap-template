import { DefaultLanguage } from './languages/default';

export type Language = {
    [P in keyof typeof DefaultLanguage]: typeof DefaultLanguage[P];
};