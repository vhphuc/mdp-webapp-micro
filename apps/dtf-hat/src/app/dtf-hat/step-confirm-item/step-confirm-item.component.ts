import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DtfHatOrderDetailsComponent } from '../ui/dtf-hat-order-details/dtf-hat-order-details.component';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DtfHatStoreService } from '../dtf-hat-store.service';
import { DtfHatPreviewImageComponent } from '../ui/dtf-hat-preview-image/dtf-hat-preview-image.component';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { EDtfHatAppConfirmType } from '../dtf-hat.model';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-step-confirm-item',
  standalone: true,
  imports: [
    DtfHatOrderDetailsComponent,
    KeepFocusDirective,
    NzInputDirective,
    NzTypographyComponent,
    ReactiveFormsModule,
    TranslateModule,
    DtfHatPreviewImageComponent,
    ImageErrorUrlDirective,
    UpperCasePipe,
  ],
  templateUrl: './step-confirm-item.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepConfirmItemComponent {
  input = new FormControl('', { nonNullable: true });
  store = inject(DtfHatStoreService);
  $item = this.store.$item;
  $isShowConfirmRejectPopup = signal(false);

  onScan() {
    const scanValue = this.input.getRawValue().trim().toUpperCase();
    this.input.reset();
    if (!scanValue) return;

    this.$isShowConfirmRejectPopup.set(false);
    this.store.$error.set(null);

    const reviewBarcode = this.$item()!.listReviewBarcodeConfirm.find(rb => rb.barcode.toUpperCase() === scanValue);
    if (!reviewBarcode) {
      this.store.$error.set({ errorKey: `CONFIRMATION_BARCODE_X1_IS_INVALID`, paramError: { x1: scanValue } });
      return;
    }

    if (reviewBarcode.confirmType === EDtfHatAppConfirmType.Reject) {
      this.$isShowConfirmRejectPopup.set(true);
      return;
    }

    this.store.confirmItem(reviewBarcode.barcode, reviewBarcode.confirmType);
  }

  confirmReject() {
    const reviewBarcode = this.$item()!.listReviewBarcodeConfirm.find(rb => rb.confirmType === EDtfHatAppConfirmType.Reject)!;
    this.store.confirmItem(reviewBarcode.barcode, reviewBarcode.confirmType);
  }
}
