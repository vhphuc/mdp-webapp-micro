import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { DtfHatStoreService } from '../dtf-hat-store.service';
import { DtfHatOrderDetailsComponent } from '../ui/dtf-hat-order-details/dtf-hat-order-details.component';

@Component({
  selector: 'app-step-scan-item',
  standalone: true,
  imports: [KeepFocusDirective, NzInputDirective, NzTypographyComponent, ReactiveFormsModule, TranslateModule, DtfHatOrderDetailsComponent],
  templateUrl: './step-scan-item.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepScanItemComponent {
  input = new FormControl('', { nonNullable: true });
  store = inject(DtfHatStoreService);
  $item = this.store.$item;

  onScan() {
    const scanValue = this.input.getRawValue().trim().toUpperCase();
    this.input.reset();
    if (!scanValue) return;

    const barcode = extractUnitBarcode(scanValue);

    this.store.scanItem(barcode);
  }
}
