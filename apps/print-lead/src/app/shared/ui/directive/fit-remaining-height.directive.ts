import { AfterViewInit, Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({ selector: '[appFitRemainingHeight]', standalone: true })
export class FitRemainHeightDirective implements AfterViewInit {
  @Input() appFitRemainingHeight = true;

  constructor(private element: ElementRef) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.handleFitRemainingHeight();
  }

  ngAfterViewInit(): void {
    this.handleFitRemainingHeight();
  }

  private handleFitRemainingHeight() {
    if (!this.appFitRemainingHeight) return;
    setTimeout(() => {
      // header
      const header = document.querySelector('#header');
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      // content
      const content = document.querySelector('#content');
      const contentComputed = content ? window.getComputedStyle(content) : null;
      const contentMarginTop = +(contentComputed?.marginTop.replace('px', '') ?? '0');
      const contentPaddingTop = +(contentComputed?.paddingTop.replace('px', '') ?? '0');
      // upper body
      const upperBody = document.querySelector('#upper-body');
      const upperBodyHeight = upperBody?.getBoundingClientRect().height ?? 0;
      // image
      const marginBottom = 50;
      const imageHeight = window.innerHeight - headerHeight - upperBodyHeight - contentMarginTop - contentPaddingTop - marginBottom;

      this.element.nativeElement.style.height = `${imageHeight}px`;
    }, 10);
  }
}
