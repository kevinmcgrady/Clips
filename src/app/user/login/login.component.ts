import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  showAlert = false;
  alertMessage = 'Please wait! We are logging you in';
  alertColor = 'blue';
  inSubmission = false;

  credentials = {
    email: '',
    password: '',
  };

  constructor(private auth: AngularFireAuth) {}

  async submit() {
    this.showAlert = true;
    this.alertMessage = 'Please wait! We are logging you in';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (error) {
      this.alertMessage =
        'An unexpected error occurred. Please try ahain later.';
      this.alertColor = 'red';
      return;
    } finally {
      this.inSubmission = false;
    }

    this.alertMessage = 'Success! You are now logged in.';
    this.alertColor = 'green';
  }
}
