import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DtfHatStoreService } from '../dtf-hat-store.service';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { extractHatBarcode, extractUnitBarcode, isHatBarcode } from '@shared/util/helper/extract-barcode';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-step-scan-transfer',
  standalone: true,
  imports: [KeepFocusDirective, NzInputDirective, ReactiveFormsModule, TranslateModule, NzTypographyComponent, JsonPipe],
  templateUrl: './step-scan-transfer.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepScanTransferComponent {
  store = inject(DtfHatStoreService);
  input = new FormControl('', { nonNullable: true });
  $error = this.store.$error;

  onScan() {
    const scanValue = this.input.getRawValue().trim().toUpperCase();
    this.input.reset();
    if (!scanValue) return;

    const barcode = isHatBarcode(scanValue) ? extractHatBarcode(scanValue) : extractUnitBarcode(scanValue);

    this.store.scanTransfer(barcode);
  }
}
