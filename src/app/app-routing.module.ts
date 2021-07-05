import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { LoginComponent } from "./auth/login/login.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { PostList } from "./post-list/post-list.component";
import { CreatePostsComponent } from "./posts/create-posts/create-posts.component";

const route:Routes=[
    {path:'', component:PostList},
    {path:'create', component:CreatePostsComponent, canActivate:[AuthGuard] },
    {path:'edit/:id', component:CreatePostsComponent, canActivate:[AuthGuard] },
    {path:'login', component:LoginComponent},
    {path:'signup', component:SignupComponent}
]
@NgModule({
    imports:[RouterModule.forRoot(route)],
    exports:[RouterModule],
    providers:[AuthGuard]

})
export class AppRoutingModule{

}