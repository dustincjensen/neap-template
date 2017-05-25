import { Component } from '@angular/core';
import { ServiceProxy } from '../_providers/serviceProxy.generated';

@Component({
    moduleId: module.id,
    selector: 'home',
    templateUrl: 'home.html'
})
export class HomeComponent {
    title: string;
    content: any;

    constructor(
        private serviceProxy: ServiceProxy) {
    }

    async ngOnInit() {
        this.title = 'Home Page';
        this.content = JSON.stringify(await this.serviceProxy.requestLoginChallenge());
    }
}