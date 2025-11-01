import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DtfHatStoreService } from './dtf-hat-store.service';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { DtfHatBreadCrumbComponent } from './ui/dtf-hat-bread-crumb/dtf-hat-bread-crumb.component';
import { DtfHatConfigComponent } from './ui/dtf-hat-config/dtf-hat-config.component';
import { DtfHatStep } from './dtf-hat.model';
import { StepScanTransferComponent } from './step-scan-transfer/step-scan-transfer.component';
import { StepScanItemComponent } from './step-scan-item/step-scan-item.component';
import { StepConfirmItemComponent } from './step-confirm-item/step-confirm-item.component';
import { StepConfirmCompleteComponent } from './step-confirm-complete/step-confirm-complete.component';

@Component({
  selector: 'app-dtf-hat',
  standalone: true,
  imports: [
    AppLayoutComponent,
    DtfHatBreadCrumbComponent,
    DtfHatConfigComponent,
    StepScanTransferComponent,
    StepScanItemComponent,
    StepConfirmItemComponent,
    StepConfirmCompleteComponent,
  ],
  templateUrl: './dtf-hat.component.html',
  styles: ``,
  providers: [DtfHatStoreService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtfHatComponent {
  store = inject(DtfHatStoreService);
  $step = this.store.$step;

  protected readonly DtfHatStep = DtfHatStep;
}
