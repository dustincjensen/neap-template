import { Component } from '@angular/core';
import { ServiceProxy } from '../_service/serviceProxy.generated';
import { ServiceProxyTypes } from '../_service/serviceProxy.generated.types';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent {
    title: string;
    examples: ServiceProxyTypes.Example[];

    constructor(
        private exampleProxy: ServiceProxy.ExampleProxy) {
    }

    async ngOnInit() {
        this.title = 'Example Page';
        this.examples = await this.exampleProxy.getExamples();
    }

    async delete(example: ServiceProxyTypes.Example) {        
        await this.exampleProxy.deleteExample(example.exampleID);
        let index = this.examples.indexOf(example);
        this.examples.splice(index, 1);
    }
}