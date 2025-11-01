import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DtfHatOrderDetailsComponent } from '../ui/dtf-hat-order-details/dtf-hat-order-details.component';
import { DtfHatPreviewImageComponent } from '../ui/dtf-hat-preview-image/dtf-hat-preview-image.component';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DtfHatStoreService } from '../dtf-hat-store.service';
import { extractHatBarcode, extractUnitBarcode, isHatBarcode } from '@shared/util/helper/extract-barcode';
import { EDtfHatAppConfirmType } from '../dtf-hat.model';

@Component({
  selector: 'app-step-confirm-complete',
  standalone: true,
  imports: [
    DtfHatOrderDetailsComponent,
    DtfHatPreviewImageComponent,
    ImageErrorUrlDirective,
    KeepFocusDirective,
    NzInputDirective,
    NzTypographyComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './step-confirm-complete.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepConfirmCompleteComponent {
  input = new FormControl('', { nonNullable: true });
  store = inject(DtfHatStoreService);
  $item = this.store.$item;

  onScan() {
    const scanValue = this.input.getRawValue().trim().toUpperCase();
    this.input.reset();
    if (!scanValue) return;

    const barcode = isHatBarcode(scanValue) ? extractHatBarcode(scanValue) : extractUnitBarcode(scanValue);

    this.store.scanTransfer(barcode);
  }

  protected readonly EDtfHatAppConfirmType = EDtfHatAppConfirmType;
}
