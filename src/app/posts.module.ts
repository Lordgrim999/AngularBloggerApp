import { NgModule } from '@angular/core';
import { CreatePostsComponent } from './posts/create-posts/create-posts.component';
import { PostList } from './post-list/post-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './angular-material.module';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [CreatePostsComponent, PostList],
  exports: [CreatePostsComponent, PostList],
  imports: [
    ReactiveFormsModule,
    AngularMaterialModule,
    AppRoutingModule,
    CommonModule,
  ],
})
export class PostModule {}
