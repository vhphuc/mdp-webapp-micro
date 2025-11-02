import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { JitReceiveStoreService } from '../jit-receive-store.service';
import { JitReceiveBarcodeType, JitReceiveStep } from '../jit-receive.model';
import { JitReceiveItemComponent } from '../ui/jit-receive-item/jit-receive-item.component';

@Component({
  selector: 'app-step-item-missing',
  standalone: true,
  imports: [
    FormsModule,
    NzTypographyComponent,
    TranslateModule,
    NzColDirective,
    NzRowDirective,
    UpperCasePipe,
    JitReceiveItemComponent,
  ],
  templateUrl: './step-item-missing.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepItemMissingComponent {
  store = inject(JitReceiveStoreService);

  cancel() {
    this.store.error.set(null);
    this.store.step.set(JitReceiveStep.CONFIRM_RECEIPT);
  }

  acceptMissing() {
    const step = this.store.step();
    const actionBarcodeType = step === JitReceiveStep.ITEM_MISSING ? JitReceiveBarcodeType.Missing : JitReceiveBarcodeType.Damaged;
    const actionBarcode = this.store.tracking()!.actionBarcodes.find(ab => ab.type === actionBarcodeType)!;
    this.store.rejectReceipt(actionBarcode);
  }

  protected readonly JitReceiveStep = JitReceiveStep;
}
