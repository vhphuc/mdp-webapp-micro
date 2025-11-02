import { Directive, ElementRef, HostListener, input } from '@angular/core';
import { ImgPreviewService } from '@shared/lib/img-preview/img-preview.service';
import { ImgPreviewInput } from '@shared/lib/img-preview/img-preview.model';

@Directive({
  selector: 'img[src][appPreviewImage]',
  standalone: true,
})
export class ImgPreviewDirective {
  appPreviewImage = input([], { transform: previewImgTransform });
  constructor(
    private readonly _imgPreviewSvc: ImgPreviewService,
    private readonly _el: ElementRef
  ) {}

  @HostListener('click')
  onClickImage() {
    if (this.appPreviewImage().length) {
      this._imgPreviewSvc.preview(this.appPreviewImage());
    } else {
      const src = (this._el.nativeElement as HTMLImageElement).src;
      this._imgPreviewSvc.preview([{ url: src }]);
    }
  }
}

function previewImgTransform(input: string | string[] | ImgPreviewInput): ImgPreviewInput {
  if (typeof input === 'string') {
    if (!input) return [];
    return [{ url: input }];
  } else if (input.every(i => typeof i === 'string')) {
    const urls = input as string[];
    return urls.map(url => ({ url }));
  } else {
    return input as ImgPreviewInput;
  }
}
