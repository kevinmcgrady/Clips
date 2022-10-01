import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import IUser from '../models/user.model';
import { delay, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {
    this.usersCollection = this.db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(map((user) => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
  }

  public async createUser(userData: IUser) {
    const userCreds = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password as string
    );

    if (!userCreds.user) {
      throw new Error("User can't be found");
    }

    await this.usersCollection.doc(userCreds.user.uid).set({
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      age: userData.age,
    });

    await userCreds.user.updateProfile({ displayName: userData.name });
  }

  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault();
    }
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }
}
