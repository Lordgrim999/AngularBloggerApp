import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostType } from '../posts/post.model';
import { Subscription } from 'rxjs';
import { PostService } from '../posts/post.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'md-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostList implements OnInit, OnDestroy {
  posts: PostType[] = [];
  isLoading = false;
  pageLength!: number;
  postPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [2, 5, 10, 15];
  isUserAuthenticated: boolean = false;
  userId!: string;

  private sub!: Subscription;
  private authSub: Subscription;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    //spinner started moving
    this.isLoading = true;

    //this method check wether are we logged in

    this.isUserAuthenticated = this.authService.getIsAuth();
    //here we are retrieving user id of user who is currently logged in
    this.userId = this.authService.getUserId();

    //this listener check wether are we logged out
    this.authSub = this.authService
      .getAuthListener()
      .subscribe(isAuthenticated => {
        //console.log('in post-list', isAuthenticated);
        this.isUserAuthenticated = isAuthenticated;
        //need to again fetch user id if user changes
        this.userId = this.authService.getUserId();
      });

    this.sub = this.postService
      .getPostsUpdatedListener()
      .subscribe((postData: { posts: PostType[]; countPost: number }) => {
        //spinner stopped
        this.isLoading = false;

        this.pageLength = postData.countPost;
        this.posts = postData.posts;
      });
    //default values shown during pagination 2 post per page and current page no is 1
    this.postService.getPosts(this.postPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.postService.deletePost(postId).subscribe(
      () => {
        this.router.navigate(['/']);
        this.postService.getPosts(this.postPerPage, this.currentPage);
      },
      err => {
        this.isLoading = false;
      }
    );
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.authSub.unsubscribe();
  }

  onPageChange(pageData: PageEvent) {
    //on changing page event
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1; //since in paginator page index starts from 0
    this.postPerPage = pageData.pageSize;
    this.postService.getPosts(this.postPerPage, this.currentPage);
  }
}
