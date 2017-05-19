import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class HomeProvider {
    constructor(public http: Http) {}

    public async getHomeData(): Promise<any> {
        let response = await this.http.get('/login/request').toPromise();
        return response.json();
    }    
}
