import { DestroyRef, inject, Injectable } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ImgPreviewComponent } from '@shared/lib/img-preview/img-preview.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { ImgPreviewInput } from '@shared/lib/img-preview/img-preview.model';

@Injectable({
  providedIn: 'root',
})
export class ImgPreviewService {
  destroyRef = inject(DestroyRef);

  constructor(private readonly overlay: Overlay) {}

  preview(images: ImgPreviewInput) {
    const overlayRef = this.createOverlay();
    const previewComponent = this.attachPreviewComponent(overlayRef);
    previewComponent.$images.set(images);
    this.handleInteraction(previewComponent, overlayRef);
  }

  private createOverlay(): OverlayRef {
    const overLayConfig = new OverlayConfig({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global(),
      disposeOnNavigation: true,
      backdropClass: ['tw-fixed', 'tw-inset-0', 'tw-h-full', 'tw-z-[2000]', 'tw-bg-[rgba(0,0,0,.45)]'],
    });

    return this.overlay.create(overLayConfig);
  }

  private attachPreviewComponent(overlayRef: OverlayRef): ImgPreviewComponent {
    const containerPortal = new ComponentPortal(ImgPreviewComponent, null);
    const containerRef = overlayRef.attach(containerPortal);

    return containerRef.instance;
  }

  private handleInteraction(previewCmp: ImgPreviewComponent, overlayRef: OverlayRef) {
    overlayRef
      .keydownEvents()
      .pipe(
        filter(event => event.code === 'Escape'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        event.preventDefault();
        overlayRef.dispose();
      });

    previewCmp.closeClick.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      overlayRef.dispose();
    });

    previewCmp.containerClick.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      overlayRef.dispose();
    });
  }
}
