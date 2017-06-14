import { suite, test } from 'mocha-typescript';
import { assert } from 'chai';

/**
 * Used to demonstrate mocha test suite w/ chai assertions.
 */
class Example {
    public returnValue(x: number): number {
        if (x === 5) {
            return -1;
        }
        return x;
    }
}

@suite()
class ExampleTests {

    // The Class to test.
    private subject: Example;

    // before only runs once, before all the tests.
    public before() {
        this.subject = new Example();
    }

    //public beforeEach() {}
    //public after() {}
    //public afterEach() {}

    @test('Get Return Value 10')
    public exampleReturn10() {
        let output = this.subject.returnValue(10);
        assert.strictEqual(output, 10);
    }

    @test('Get Return Value 5')
    public exampleReturn5() {
        let output = this.subject.returnValue(5);
        assert.strictEqual(output, 5);
    }
}