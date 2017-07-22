import { Default } from './languages/default';

export type Language = {
    [P in keyof typeof Default.DefaultLanguage]: typeof Default.DefaultLanguage[P];
};