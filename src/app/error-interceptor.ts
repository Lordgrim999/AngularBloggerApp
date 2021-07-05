// this feature is provided by HttpClientModule to manipulate our

import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorComponent } from './error/error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private dialog: MatDialog) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    //here we are trying to listen the response of http request if there have any error

    // since we are subscribing the http response in authservice and postservice we need to return
    // an observable since subscribe will be accepcting an observable even we get an error

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        let message = 'Some Error Occured!!';
        if (err.error.message) {
          message = err.error.message;
        }
        this.dialog.open(ErrorComponent, { data: { message: message } }); // second argument will pass the error data to the error component
        return throwError(err);
      })
    );
  }
}
