import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { AuthDataType } from './auth-data.model';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  // we are adding this listener so that when we logout the token will be undefined
  // and this should be reflecte in all component so we add event
  // so a component can verify status of authorization
  isAuthenticated: boolean = false;
  private authListener = new Subject<boolean>();
  userId: string;
  tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  //this method is for post-list component to check authorization as they are loaded after we push info or afrer logging in
  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  autoAuthUser() {
    const authoInformation = this.getAuthData();
    const now = new Date();
    const diff = authoInformation.expirationDate.getTime() - now.getTime(); //returns milliseconds
    if (diff > 0) {
      this.token = authoInformation.token;
      this.isAuthenticated = true;
      this.userId = authoInformation.userId;
      this.setAuthTimer(diff / 1000);
      this.authListener.next(true);
    }
  }

  getAuthListener(): Observable<boolean> {
    //this will return status of authorization
    return this.authListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  createUser(email: string, password: string) {
    const authData: AuthDataType = { email: email, password: password };
    //this request must be handled by signup component as we need to show appropiate message if
    //it fails
    this.http.post(BACKEND_URL + '/signup', authData).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      error => {
        this.authListener.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const authData: AuthDataType = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        BACKEND_URL + '/login',
        authData
      )
      .subscribe(
        response => {
          this.token = response.token;

          //telling the listener that we are logged in
          // we will add logout function and made listener false as other component may know about status dynamically
          // here we are simply pushing this info to othe component
          //there is a case where we redirect to post-list component or HomePage after logging
          // in that case we are subscribing the authListener after logging is that after we have authorized and
          //push this info to other components
          if (this.token) {
            const expireDuration = response.expiresIn;
            this.setAuthTimer(expireDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authListener.next(true);
            const now = new Date();
            const expiredDate = new Date(now.getTime() + expireDuration * 1000);
            //console.log(expiredDate);
            this.setAuthData(this.token, expiredDate, response.userId);
            this.router.navigate(['/']);
          }
        },
        error => {
          console.log(error);
          this.authListener.next(false);
        }
      );
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.removeAuthData();
    this.router.navigate(['/']);
  }

  //this method stores our token in local storage
  //so on reloading we don't loose our token
  private setAuthData(token: string, expireDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expireDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private removeAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }

  private setAuthTimer(expireDuration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expireDuration * 1000);
  }
}
