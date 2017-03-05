import { Component } from '@angular/core';
import { UsersService } from 'app/services/users.service';

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.css'],
})
export class SidebarComponent {
  users: any[] = [];

  constructor(private usersService: UsersService) {
    /*this.users = [
      {
        "id": "qwerty",
        "name": "Antonio Vaquerizo",
        "health": "Saludable",
        "contactInfo": "antonio@gmail.com",
        "obs": "Ninguna"
      },
      {
        "id": "ytrewq",
        "name": "Juan Andres",
        "health": "Mala",
        "contactInfo": "juanandres@gmail.com",
        "obs": "Ninguna"
      },
      {
        "id": "12sdg45",
        "name": "Oriol Sans",
        "health": "Muy alto",
        "contactInfo": "oms@gmail.com",
        "obs": "Es tonto"
      }
    ]*/
    this.usersService.usersEmitter.subscribe(
      data => {
        console.log("users:", data);
        this.users = data;
      },
      error => {
        console.log("error getting users");
      }
    )
  }
}
