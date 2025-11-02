import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { JitReceiveStoreService } from './jit-receive-store.service';
import { JitReceiveStep } from './jit-receive.model';
import { StepConfirmReceiptComponent } from './step-confirm-receipt/step-confirm-receipt.component';
import { StepItemMissingComponent } from './step-item-missing/step-item-missing.component';
import { StepScanItemComponent } from './step-scan-item/step-scan-item.component';
import { StepScanTrackingComponent } from './step-scan-tracking/step-scan-tracking.component';
import { JitReceiveBreadCrumbComponent } from './ui/jit-receive-bread-crumb/jit-receive-bread-crumb.component';
import { JitReceiveConfigComponent } from './ui/jit-receive-config/jit-receive-config.component';

@Component({
  selector: 'app-jit-receive',
  standalone: true,
  imports: [
    AppLayoutComponent,
    JitReceiveBreadCrumbComponent,
    JitReceiveConfigComponent,
    StepScanTrackingComponent,
    StepScanItemComponent,
    StepConfirmReceiptComponent,
    StepItemMissingComponent,
  ],
  providers: [JitReceiveStoreService],
  templateUrl: './jit-receive.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitReceiveComponent {
  step = this._store.step;

  constructor(private readonly _store: JitReceiveStoreService) {}

  protected readonly JitReceiveStep = JitReceiveStep;
}
