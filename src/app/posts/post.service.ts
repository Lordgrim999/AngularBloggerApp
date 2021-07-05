import { Injectable } from '@angular/core';
import { PostType } from './post.model';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: PostType[] = [];
  private postsUpdated = new Subject<{
    posts: PostType[];
    countPost: number;
  }>();

  //if we want to route from component or thru code then
  //we add Router Service
  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postPerPage: number, currentPage: number): void {
    //name of the parameter should be same as defined in backend
    const queryParams = `?pageSize=${postPerPage}&currentPage=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; countPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map(response => {
          return {
            //here we are transforming the id to _id only on posts not on countPost
            posts: response.posts.map(
              (post: {
                title: any;
                description: any;
                _id: any;
                imagePath: any;
                creator: any;
              }) => {
                //returning the posts object with _id changed to id
                return {
                  title: post.title,
                  description: post.description,
                  id: post._id,
                  imagePath: post.imagePath,
                  creator: post.creator,
                };
              }
            ),
            //here we are returning the number of post in database
            countPost: response.countPosts,
          };
        })
      )
      .subscribe(transformedPostData => {
        console.log('after adding creator', transformedPostData);
        this.posts = transformedPostData.posts;
        //console.log(this.posts);

        this.postsUpdated.next({
          posts: [...this.posts],
          countPost: transformedPostData.countPost,
        });
      });
  }
  getPostsUpdatedListener(): Observable<{
    posts: PostType[];
    countPost: number;
  }> {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, description: string, image: File) {
    //FormData allows us to add file or blob type since json do not add file type
    const postData = new FormData();
    postData.append('title', title);
    postData.append('description', description);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: PostType }>(BACKEND_URL, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }

  //calling server get to fetch info from backend server about post during editing post
  //it needs to contain info
  getPost(id: string) {
    // we cant subscribe this http call here because we have to return
    //post to our create post component and we cannot retrun inside subscribe
    // as return should be synchronous and observable is async
    // so instead we retrun observable and let our create component subscribe it
    return this.http.get<{
      _id: string;
      title: string;
      description: string;
      imagePath: string;
      creator: string;
    }>(BACKEND_URL + id);
  }

  updatePost(
    id: string,
    title: string,
    description: string,
    image: string | File
  ) {
    //console.log("in updatePost",id);
    //here we are checking wether we are editing image or not

    // here we are checking that the image is string or object
    let postData: PostType | FormData;
    if (typeof image === 'object') {
      //if it is object then we would create a formdata
      //true when we are editing image then image is object
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('description', description);
      postData.append('image', image, title);
    } else {
      //false when we are not editing image
      //then image is simply string
      //else we would create a json
      postData = {
        id: id,
        title: title,
        description: description,
        imagePath: image,
        // can be set to userId but for user can then manipulate the post
        //so handled at backend
        creator: null,
      };
    }
    this.http.put(BACKEND_URL + id, postData).subscribe(result => {
      this.router.navigate(['/']);
    });
  }
}
