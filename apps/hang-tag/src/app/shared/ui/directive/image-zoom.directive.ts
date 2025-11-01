import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
  Renderer2,
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { fromEvent, tap, throttleTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/*
 * Parent of Image need to be relative
 * */
@Directive({
  selector: 'img[appImageZoom]',
  standalone: true,
})
export class ImageZoomDirective implements AfterViewInit {
  image = inject(ElementRef).nativeElement as HTMLImageElement;
  zoomContainer = document.createElement('div');
  zoomLen = document.createElement('div');
  zoomResult = document.createElement('div');

  zoomLenSize = 50;
  zoomResultSize = 600;
  ratioX = () => this.zoomResultSize / this.zoomLenSize;
  ratioY = () => this.zoomResultSize / this.zoomLenSize;

  @Output() clickOnZoomLen = new EventEmitter();

  constructor(
    private readonly _renderer2: Renderer2,
    private readonly _nzModalSvc: NzModalService
  ) {}

  ngAfterViewInit(): void {
    this.initElement();
    this.onWindowResize.subscribe();
  }

  initElement() {
    // wrap image with container
    const parent = this.image.parentNode;

    this.image.className = 'tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-contain tw-object-left-top';

    this._renderer2.setStyle(this.zoomContainer, 'position', 'relative');
    parent!.append(this.zoomContainer);

    this.zoomLen = document.createElement('div');
    this._renderer2.setStyle(this.zoomLen, 'position', 'absolute');
    this._renderer2.setStyle(this.zoomLen, 'cursor', 'wait');
    this._renderer2.setStyle(this.zoomLen, 'display', `none`);
    this._renderer2.setStyle(this.zoomLen, 'border', '1px solid black');
    this._renderer2.setStyle(this.zoomLen, 'background-color', '#d6d6d6');
    this._renderer2.setStyle(this.zoomLen, 'opacity', '0.5');

    this.zoomResult = document.createElement('div');
    this._renderer2.setStyle(this.zoomResult, 'position', 'absolute');
    this._renderer2.setStyle(this.zoomResult, 'display', `none`);
    this._renderer2.setStyle(this.zoomResult, 'border', '1px solid black');
    this._renderer2.setStyle(this.zoomResult, 'height', `${this.zoomResultSize}px`);
    this._renderer2.setStyle(this.zoomResult, 'width', `${this.zoomResultSize}px`);
    this._renderer2.setStyle(this.zoomResult, 'top', '0');
    this._renderer2.setStyle(this.zoomResult, 'left', `-${this.zoomResultSize}px`);
    this._renderer2.setStyle(this.zoomResult, 'background-color', '#eee');
    this._renderer2.setStyle(this.zoomResult, 'background-image', 'url(' + this.image.src + ')');

    this.zoomContainer!.append(this.zoomResult, this.zoomLen);
    // zoom len events
    this.zoomLen.onclick = () => this.clickOnZoomLen.emit();
  }

  @HostListener('load')
  onLoad() {
    this._renderer2.setStyle(this.zoomResult, 'background-image', 'url(' + this.image.src + ')');
    this.reCalcContainerSize();
  }

  onWindowResize = fromEvent(window, 'resize').pipe(
    throttleTime(1000),
    tap(ev => this.reCalcContainerSize()),
    takeUntilDestroyed()
  );

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const imagePreviewElement = document.querySelector('.ant-image-preview-wrap');

    if (this.image.src.includes('no-image-available')) return;
    if (this._nzModalSvc.openModals.length) return;
    if (imagePreviewElement) return;

    const { left, top } = this.image.getBoundingClientRect();
    const { width, height } = getContainedSize(this.image);

    if (e.clientX < left || left + width < e.clientX || e.clientY < top || top + height < e.clientY) {
      this._renderer2.setStyle(this.zoomLen, 'display', `none`);
      this._renderer2.setStyle(this.zoomResult, 'display', `none`);
      return;
    }
    // HTMLDivElement zoomLen offsetWidth offsetHeight = 0 if display none.
    this._renderer2.setStyle(this.zoomLen, 'display', `block`);
    this._renderer2.setStyle(this.zoomResult, 'display', `block`);

    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    let x = mouseX - this.zoomLen.offsetWidth / 2;
    let y = mouseY - this.zoomLen.offsetHeight / 2;

    if (x > width - this.zoomLen.offsetWidth) {
      x = width - this.zoomLen.offsetWidth;
    }
    if (x < 0) {
      x = 0;
    }
    if (y > height - this.zoomLen.offsetHeight) {
      y = height - this.zoomLen.offsetHeight;
    }
    if (y < 0) {
      y = 0;
    }

    this._renderer2.setStyle(this.zoomLen, 'left', `${x}px`);
    this._renderer2.setStyle(this.zoomLen, 'top', `${y}px`);

    this._renderer2.setStyle(this.zoomResult, 'background-position', `-${x * this.ratioX()}px -${y * this.ratioY()}px`);
  }

  reCalcContainerSize() {
    const size = getContainedSize(this.image);
    const smallerSize = size.height > size.width ? size.width : size.height;
    this.zoomLenSize = Math.floor(smallerSize / 3);
    this._renderer2.setStyle(this.zoomLen, 'height', `${this.zoomLenSize}px`);
    this._renderer2.setStyle(this.zoomLen, 'width', `${this.zoomLenSize}px`);
    this._renderer2.setStyle(this.zoomLen, 'cursor', 'zoom-in');
    this._renderer2.setStyle(this.zoomResult, 'background-size', `${size.width * this.ratioX()}px ${size.height * this.ratioY()}px`);
    this._renderer2.setStyle(this.zoomContainer, 'height', size.height + 'px');
    this._renderer2.setStyle(this.zoomContainer, 'width', size.width + 'px');
  }
}

function getContainedSize(img: HTMLImageElement): { width: number; height: number } {
  const ratio = img.naturalWidth / img.naturalHeight;
  let width = img.height * ratio;
  let height = img.height;
  if (width > img.width) {
    width = img.width;
    height = img.width / ratio;
  }
  return { width, height };
}
