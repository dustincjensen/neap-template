import {
    table,
    primaryKey,
    foreignKey,
    required,
    range
} from './modelDecorators';

@table()
export class Example {
    @primaryKey()
    @required()
    public exampleID: number;

    @required()
    public name: string;

    public description: string;

    @range(1989, 2017)
    @required()
    public year: number;
}