import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImgPreviewInput } from '@shared/lib/img-preview/img-preview.model';

@Component({
  selector: 'app-img-preview',
  standalone: true,
  imports: [CommonModule, NzIconModule, ImageErrorUrlDirective],
  template: `
    <div class="tw-pointer-events-none tw-h-full tw-text-center">
      <div>
        <div class="tw-fixed tw-inset-0 tw-overflow-hidden">
          <ul
            class="tw-m-0 tw-p-0 tw-flex tw-flex-row-reverse tw-items-center tw-w-full tw-list-none tw-text-[rgba(255,255,255,.85)] tw-bg-[rgba(0,0,0,.1)] tw-pointer-events-auto">
            <li class="tw-ml-3 tw-p-3 tw-cursor-pointer" (click)="onClose()">
              <span class="ant-image-preview-operations-icon" nz-icon nzType="close" nzTheme="outline"></span>
            </li>
          </ul>
          <div class="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-gap-4 tw-select-none">
            @for (image of $images(); track image) {
              <div
                class="tw-h-3/4 tw-flex tw-flex-col"
                [ngClass]="{ 'tw-w-3/5': $images().length === 1 }"
                [ngStyle]="{ width: 100 / $images().length + '%' }">
                @if (image.title) {
                  <div class="tw-text-center tw-bg-white">
                    <span class="tw-text-2xl tw-font-bold tw-px-2">{{ image.title }}</span>
                  </div>
                }
                <div class="tw-flex-1 tw-image-fill tw-bg-[#eee]">
                  <img [src]="image.url" appImageErrorUrl class="tw-pointer-events-auto" />
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'tw-fixed tw-inset-0 tw-z-[2000] tw-bg-[rgba(0,0,0,.45)]',
  },
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImgPreviewComponent implements OnInit {
  $images = signal<ImgPreviewInput>([]);
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly _host: ElementRef<HTMLElement>,
    private readonly ngZone: NgZone
  ) {}

  closeClick = new EventEmitter<void>();
  containerClick = new EventEmitter<void>();

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this._host.nativeElement, 'click')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(event => {
          if (event.target === event.currentTarget) {
            this.ngZone.run(() => this.containerClick.emit());
          }
        });
    });
  }

  onClose() {
    this.closeClick.emit();
  }
}
