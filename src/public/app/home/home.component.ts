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
        private homeProxy: ServiceProxy.HomeProxy,
        private loginProxy: ServiceProxy.LoginProxy) {
    }

    async ngOnInit() {
        this.title = 'Home Page';
        this.content = JSON.stringify(await this.homeProxy.getHomeDashboard());

        console.log(await this.homeProxy.giveMeData({ paramOne: 'Hello', paramTwo: 'World' }));
        console.log(await this.loginProxy.requestLoginChallenge());
        console.log(await this.loginProxy.respondToLoginChallenge());
    }
}