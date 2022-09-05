import { Component } from '@angular/core';
import { ModelService } from '../services/model.service';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  constructor(
    public model: ModelService,
    public auth: AuthService,
    private afAuth: AngularFireAuth
  ) {}

  openModel($event: Event) {
    $event.preventDefault();
    this.model.toggleModel('auth');
  }

  async logout($event: Event) {
    $event.preventDefault();
    await this.afAuth.signOut();
  }
}
