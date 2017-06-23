import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ExampleComponent } from './example/example.component';
import { ServiceProxyModule } from './_service/serviceProxy.generated.module';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        ServiceProxyModule
    ],
    declarations: [
        AppComponent,
        ExampleComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }