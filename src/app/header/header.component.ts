import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'md-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  //use this property to check that user is authenticated and use in template to hide login and signup
  isUserAuthenticated:boolean=false;
  private sub:Subscription;
  constructor(private authService:AuthService) { }

  ngOnInit(){
    //here we are checking that we are logged in or not
    //we are using event subject from authservice that will update listener when we are logged in or logged out
    
    //same case as in post-list component 
    this.isUserAuthenticated=this.authService.getIsAuth();

    this.sub=this.authService.getAuthListener().subscribe(
      (isAuthenticated)=>{
        //updating public property whenever user authentication changes
        this.isUserAuthenticated = isAuthenticated;

      }
    );
  }

  ngOnDestroy(){
    //here we are calling a observable that we are handling so we must unsubscribe it also
    this.sub.unsubscribe();
  }

  onLogout()
  {
    this.authService.logout();
  }

}
