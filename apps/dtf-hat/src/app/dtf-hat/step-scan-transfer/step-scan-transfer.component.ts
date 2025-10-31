import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { extractHatBarcode, extractUnitBarcode, isHatBarcode } from '@shared/util/helper/extract-barcode';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { DtfHatStore } from '../dtf-hat.store';

@Component({
  selector: 'app-step-scan-transfer',
  standalone: true,
  imports: [KeepFocusDirective, NzInputDirective, ReactiveFormsModule, TranslateModule, NzTypographyComponent],
  templateUrl: './step-scan-transfer.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepScanTransferComponent {
  store = inject(DtfHatStore);
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
