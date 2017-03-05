import { Injectable, EventEmitter } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class UsersService {
  private url = 'http://10.192.243.26:4200';
  users: any[] = [];
  usersEmitter: EventEmitter<any[]>;
  private socket: any;


  constructor() {
    var that = this;
    this.usersEmitter = new EventEmitter<any[]>();
    console.log(io);
    this.socket = io.connect(that.url);
    console.log(that.socket);
    this.socket.on('connect', function(){
      console.log("Client connected");
      this.emit("room", "web", "1234567890", "533");
      //console.log(this);
    });
    this.socket.on('toGroup', function(message: any){
      console.log("New group message: " + message);
    });
    this.socket.on('user', function(last: boolean, uid: any, dni: any, status: any, lat: any, lng: any){ //0 risk. 1 no risk
      var user = {
        "last": last,
        "uid": uid,
        "dni": dni,
        "status": status,
        "lat": +lat,
        "lng": +lng
      };
      //console.log("hello");
      let num = that.existsUser(user);
      console.log("users", num);
      console.log("user", user, dni);
      /*if (this.users.length < 1) {
        this.lat = user["lat"];
        this.lng = user["lng"];
        this.initMap(+user["lat"], +user["lng"]);
      }*/
      if (num == -1) {
        /*var myLatlng = new google.maps.LatLng(+user["lat"],+user["lng"]);
        var marker = new google.maps.Marker({
            position: myLatlng,
            title: user["uid"]
        });
        user["marker"] = marker;
        user["marker"].setMap(this.map);*/
        console.log("user uuid: ", user["dni"]);
        this.emit("searchperson", user["dni"], "");
        this.on("searchresult", function(id: any, name: any, health: any, contact: any, obs: any) {
          console.log("got response");
          if (id) {
            console.log("hello");
            user["name"] = name;
            user["health"] = health;
            user["contact"] = contact;
            user["obs"] = obs;
            console.log("user", user);
            that.users.push(user);
            that.usersEmitter.emit(that.users);
          } else {
            that.users.push(user);
            that.usersEmitter.emit(that.users);
          }
        });

      console.log("Got info user: " + user["lat"] + " / " + user["lng"]);
    } else {
      console.log("bye");
      that.users[num]["last"] = last;
      that.users[num]["status"] = status;
      that.users[num]["lat"] = +lat;
      that.users[num]["lng"] = +lng;
      that.usersEmitter.emit(that.users);
    }
  });
}

/*loadUser(user: any) {
  var that = this;
  this.socket.emit("searchperson", user["dni"], "");
  this.socket.on("searchresult", function(id: any, name: any, health: any, contact: any, obs: any) {
    console.log("got response");
    if (id) {
      console.log("hello");
      user["name"] = name;
      user["health"] = health;
      user["contact"] = contact;
      user["obs"] = obs;
      that.users.push(user);
      that.usersEmitter.emit(that.users);
    } else {
      console.log("bye");
      that.users[num]["last"] = last;
      that.users[num]["status"] = status;
      that.users[num]["lat"] = +lat;
      that.users[num]["lng"] = +lng;
      that.usersEmitter.emit(that.users);
    }
  });
}*/

  existsUser(user: any): number {
    for (let i = 0 ; i < this.users.length ; i++) {
      if (this.users[i]["uid"] == user["uid"]) {
        return i;
      }
    }
    return -1;
  }

  getUsers(): any[] {
    return this.users;
  }

}
