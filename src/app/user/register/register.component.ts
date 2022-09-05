import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  constructor(private auth: AuthService) {}

  showAlert = false;
  inSubmission = false;
  alertMessage = 'Please wait! your account is being created.';
  alertColor = 'blue';

  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email]);
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ]);
  confirm_password = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [Validators.required]);

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber,
  });

  async register() {
    this.showAlert = true;
    this.inSubmission = true;
    this.alertMessage = 'Please wait! your account is being created.';
    this.alertColor = 'blue';

    try {
      await this.auth.createUser(this.registerForm.value as IUser);
    } catch (error) {
      this.alertMessage =
        'An unexpected error occurred. Please try again later';
      this.alertColor = 'red';
      return;
    } finally {
      this.inSubmission = false;
    }

    this.alertMessage = 'Success! Your account has been created.';
    this.alertColor = 'green';
  }
}