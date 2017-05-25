import { NgModule } from '@angular/core';
import { ServiceProxy } from './serviceProxy.generated';

@NgModule({
	providers: [
		ServiceProxy.HomeProxy,
		ServiceProxy.LoginProxy,
	]
})
export class ServiceProxyModule {}