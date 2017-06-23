import { Component } from '@angular/core';
import { ServiceProxy } from '../_service/serviceProxy.generated';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent {
    title: string;
    content: any;

    constructor(
        private exampleProxy: ServiceProxy.ExampleProxy) {
    }

    async ngOnInit() {
        this.title = 'Example Page';
        this.content = JSON.stringify(await this.exampleProxy.getExamples());
    }
}