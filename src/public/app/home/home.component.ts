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
        private proxy: ServiceProxy.HomeProxy) {
    }

    async ngOnInit() {
        this.title = 'Home Page';
        this.content = JSON.stringify(await this.proxy.getHomeDashboard());
    }
}