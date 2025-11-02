import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { extractJitItemBarcode } from '@shared/util/helper/extract-barcode';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { JitReceiveStoreService } from '../jit-receive-store.service';
import { JitReceiveItemComponent } from '../ui/jit-receive-item/jit-receive-item.component';
import { JitReceiveLeftPanelComponent } from '../ui/jit-receive-left-panel/jit-receive-left-panel.component';

@Component({
  selector: 'app-step-scan-item',
  standalone: true,
  imports: [
    FormsModule,
    JitReceiveLeftPanelComponent,
    KeepFocusDirective,
    NzInputDirective,
    NzTypographyComponent,
    TranslateModule,
    ReactiveFormsModule,
    JitReceiveItemComponent,
  ],
  templateUrl: './step-scan-item.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepScanItemComponent {
  input = new FormControl('', { nonNullable: true });
  store = inject(JitReceiveStoreService);
  latestConfirmedPackageUnit = this.store.latestConfirmedPackageUnit;

  onScan() {
    const scanValue = this.input.getRawValue().trim().toUpperCase();
    this.input.reset();
    if (!scanValue) return;

    this.store.scanItem(extractJitItemBarcode(scanValue));
  }
}
