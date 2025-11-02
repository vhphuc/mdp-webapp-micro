import { AfterViewInit, booleanAttribute, Directive, ElementRef, HostListener, Input, Optional } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { tap } from 'rxjs';

@Directive({
  selector: 'input[appKeepFocus]',
  standalone: true,
})
export class KeepFocusDirective implements AfterViewInit {
  @Input({ transform: booleanAttribute }) focusOnInitOnly = false;

  constructor(
    private readonly _elementRef: ElementRef,
    @Optional() private readonly _nzModalSvc: NzModalService | null
  ) {}

  ngAfterViewInit() {
    (this._elementRef.nativeElement as HTMLInputElement).focus();

    this._nzModalSvc?.afterAllClose
      .pipe(
        tap(() => {
          (this._elementRef.nativeElement as HTMLInputElement).focus();
        })
      )
      .subscribe();
  }

  @HostListener('blur')
  onBlur() {
    if (!this.focusOnInitOnly) {
      (this._elementRef.nativeElement as HTMLInputElement).focus();
    }
  }
}
