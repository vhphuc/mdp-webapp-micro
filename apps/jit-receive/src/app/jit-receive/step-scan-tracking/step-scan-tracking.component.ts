import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzInputModule } from 'ng-zorro-antd/input';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { JitReceiveStoreService } from '../jit-receive-store.service';
import { JitReceiveLeftPanelComponent } from '../ui/jit-receive-left-panel/jit-receive-left-panel.component';

@Component({
  selector: 'app-step-scan-tracking',
  standalone: true,
  imports: [TranslateModule, NzInputModule, KeepFocusDirective, ReactiveFormsModule, NzTypographyComponent, JitReceiveLeftPanelComponent],
  templateUrl: './step-scan-tracking.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepScanTrackingComponent {
  input = new FormControl('', { nonNullable: true });
  error = this._store.error;

  isDone = computed(() => {
    const tracking = this._store.tracking();
    if (!tracking) return false;
    return tracking.missingQty + tracking.damagedQty + tracking.receivedQty === tracking.totalQuantity;
  });
  missingQty = computed(() => this._store.tracking()?.missingQty);
  damagedQty = computed(() => this._store.tracking()?.damagedQty);
  vendor = computed(() => this._store.tracking()?.vendor);

  confirmedMsg = this._store.confirmedMsg;

  constructor(private readonly _store: JitReceiveStoreService) {}

  onScan() {
    const scanValue = this.input.getRawValue().trim();
    this.input.reset();
    if (!scanValue) return;

    this._store.scanTracking(scanValue);
  }
}
