import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ServiceProxyModule } from './_service/serviceProxy.generated.module';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        ServiceProxyModule
    ],
    declarations: [
        AppComponent,
        HomeComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }