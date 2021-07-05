// this feature is provided by HttpClientModule to manipulate our

import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

//outgoing request like in our case adding jwt

//needs to have injectable as in the end auth-interceptor is a service
//and a service injecting another service needs to be implement injectable
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken();
    //need to clone the original request to not run into any sideeffects
    //and can edit in clone
    //console.log(' in auth interceptor', token);
    const authRequest = req.clone({
      headers: req.headers.set('authorization', 'Bearer ' + token),
    });
    return next.handle(authRequest);
  }
}
