import {
    testData, table, primaryKey,
    foreignKey, required, range
} from './modelDecorators';

@testData<Example>([
    {
        exampleID: 10,
        name: 'Foo Fighters',
        description: 'Their new hit single \'Run\' off the new album \'Concrete and Gold\'.',
        year: 2017
    },
    {
        exampleID: 20,
        name: 'Muse',
        description: '\'Dead Inside\', \'Supermassive Black Hole\' and \'Knights of Cydonia\'. These are just a few of the amazing songs you may have heard from Muse.',
        year: 2004
    }
])
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