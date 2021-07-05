import { ProviderAstType } from '@angular/compiler';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup, NgForm, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PostType } from '../post.model';
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'md-create-posts',
  templateUrl: './create-posts.component.html',
  styleUrls: ['./create-posts.component.css'],
})
export class CreatePostsComponent implements OnInit, OnDestroy {
  //if we want info about route which is incoming to this component
  //then we need ActivatedRoute service to find about route parameters
  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  post: PostType;
  form!: FormGroup;
  title: string = '';
  imagePreview: string;
  description: string = '';
  isLoading = false;
  private id!: string | null;
  private mode: string = 'create';
  private authSub: Subscription;

  ngOnInit(): void {
    this.authSub = this.authService.getAuthListener().subscribe(authStatus => {
      this.isLoading = false;
    });

    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      description: new FormControl(null, { validators: [Validators.required] }),
      // we are validating mime type of image using asyncvalidators
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id') && paramMap.get('id') !== null) {
        this.mode = 'edit';

        this.id = String(paramMap.get('id'));
        //spinner started
        this.isLoading = true;
        //this is to load the content when editing the post
        // so we are calling getPost() from postService
        this.postService.getPost(this.id).subscribe(postData => {
          //spinner stopped
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            description: postData.description,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.form.setValue({
            title: this.post.title,
            description: this.post.description,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.id = null;
      }
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

  onSavePost() {
    if (this.form.invalid) {
      //console.log('invalid');
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      //console.log(this.form.value.image);
      this.postService.addPost(
        this.form.value.title,
        this.form.value.description,
        this.form.value.image
      );
    } else {
      this.postService.updatePost(
        String(this.id),
        this.form.value.title,
        this.form.value.description,
        this.form.value.image
      );
    }

    this.form.reset();
  }

  //on clicking pick image button it triggers the event dom object which contains the file uploaded

  onImagePicked(event: Event) {
    //typescript doesn't know that event.target is a html input type of file
    //so it doesnt know that files property exists
    // so we can resolve this by explicitly converting
    //event target into htmlinputelement
    // file is type of file object

    const file = (event.target as HTMLInputElement).files[0];
    //now since we added image control in our form
    //and the beauty of angular is that we can and new form element
    //in the form and not show to user and do the work backend only
    // we use patchValue instead of setValue bcoz setValue set all form control
    // while patchValue can change single Form control
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    //console.log(file);
    //console.log(this.form);
    //we need to convery our file object into dataUrl so
    //our image tag in html can read this url to show preview
    const reader = new FileReader();
    //onload is an event that execute function whent it done
    //loading source
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    //above event is async and it occurs after below
    //readAsDataURL it triggers above on load functioning
    //defining to read data as url
    reader.readAsDataURL(file);
  }
}
