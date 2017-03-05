import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { NameListService } from '../shared/name-list/name-list.service';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { UsersService } from 'app/services/users.service';

import { AgmCoreModule } from 'angular2-google-maps/core';

@NgModule({
  imports: [HomeRoutingModule, SharedModule, AgmCoreModule.forRoot({apiKey: ''})],
  declarations: [HomeComponent],
  exports: [HomeComponent],
  providers: [NameListService, CookieService, UsersService]
})
export class HomeModule { }
