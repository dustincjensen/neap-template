import { Component } from '@angular/core';
import { HomeProvider } from '../_providers/home-provider';

@Component({
    selector: 'home',
    templateUrl: './app/home/home.html'
})
export class HomeComponent {
    title: string;
    content: any;

    constructor(
        private $homeProvider: HomeProvider) {
    }

    async ngOnInit() {
        this.title = 'Home Page';
        this.content = JSON.stringify(await this.$homeProvider.getHomeData());
    }
}