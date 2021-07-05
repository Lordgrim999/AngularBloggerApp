//this is a function which return null if our image is a valid
//mime type or return error message ,since onload function is async
// so this should return a promise or observable

import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";
//in promise when we don't know the name of property we simply pass object
//as [key:string]:propertyType
export const mimeType = (control:AbstractControl):Promise<{[key:string]: any}> | Observable<{[key:string]: any}>=>{
  //this is added so that when editing the post  if user doesnt
  //edit the image then form will contain string so we must pass that case
  if(typeof(control.value) === 'string')
  {
    return of(null);
  }
    const file = control.value as File;
    const fileReader = new FileReader();
    //since we need to call onloadend event which is synchr
    // we need to convert it into observable
    const frObs = 
    of(
        (observer:Observer<{[key:string]: any}>)=>{
            //similar to fileReader.onloadend()
            //loadend event emit extra info about the file
            //being uploaded
            fileReader.addEventListener('loadend',()=>{
                //this create new array of 8 bits unsigned integers
                const arr= new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
                let header="";
                let isValid = false;
                for(let i=0;i<arr.length;i++)
                {
                    header+=arr[i].toString(16);//header is now hexadecimal String

                    switch (header) {
                        case "89504e47":
                          isValid = true;
                          break;
                        case "ffd8ffe0":
                        case "ffd8ffe1":
                        case "ffd8ffe2":
                        case "ffd8ffe3":
                        case "ffd8ffe8":
                          isValid = true;
                          break;
                        default:
                          isValid = false; // Or you can use the blob.type as fallback
                          break;
                      }

                      if(isValid)
                      {         //observer emits null
                          observer.next(null);
                      }
                      else
                      {
                        observer.next({invalidMimeType:true});
                      }

                      observer.complete();
                }
            
            });
            //this function triggers the above function
            fileReader.readAsArrayBuffer(file);

    });
return frObs;

};