import { Component } from '@angular/core';
import { ModelService } from '../services/model.service';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  constructor(public model: ModelService, public auth: AuthService) {}

  openModel($event: Event) {
    $event.preventDefault();
    this.model.toggleModel('auth');
  }
}
