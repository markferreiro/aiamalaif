import { Component, OnInit } from '@angular/core';
import { NameListService } from '../shared/name-list/name-list.service';
import {CookieService} from 'angular2-cookie/core';

import { UsersService } from 'app/services/users.service';
/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {

  private socket: any;
  newName: string = '';
  errorMessage: string;
  names: any[] = [];
  users: any[] = [];
  lat: number;
  lng: number;

  constructor(private usersService: UsersService) {
    //this.socket = io(this.url);
    this.usersService.usersEmitter.subscribe(
      data => {
        console.log("got", data);
        if (this.users.length < 1 && data.length > 0) {
          this.initMap(data[0]["lat"], data[0]["lng"]);
        }
        this.users = data;
      },
      error => {
        console.log("Error getting users.");
      }
    );
  }

  /**
   * Get the names OnInit
   */
  ngOnInit() {
  }

  initMap(lat: any, lng: any) {
    /*console.log("Initiating map.");
    if (this.map == undefined) {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lng},
        zoom: 8
      });
    }*/
    this.lat = lat;
    this.lng = lng;
  }

}
