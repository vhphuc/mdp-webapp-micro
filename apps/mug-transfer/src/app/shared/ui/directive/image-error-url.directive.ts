import { Directive, ElementRef, HostListener } from '@angular/core';

// not work with NgOptimizedImage ngSrc since ngSrc doesn't support change image
@Directive({
  selector: 'img[src][appImageErrorUrl]',
  standalone: true,
})
export class ImageErrorUrlDirective {
  constructor(private _el: ElementRef) {}

  @HostListener('error')
  ifSrcInvalid() {
    (this._el.nativeElement as HTMLImageElement).src = '/assets/images/no-image-available.jpg';
  }
}
