import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JitReceiveLeftPanelComponent } from '../ui/jit-receive-left-panel/jit-receive-left-panel.component';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { JitReceiveStoreService } from '../jit-receive-store.service';
import { JitReceiveItemComponent } from '../ui/jit-receive-item/jit-receive-item.component';

@Component({
  selector: 'app-step-confirm-receipt',
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
  templateUrl: './step-confirm-receipt.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepConfirmReceiptComponent {
  input = new FormControl('', { nonNullable: true });
  store = inject(JitReceiveStoreService);

  onScan() {
    const scanValue = this.input.getRawValue().trim().toUpperCase();
    this.input.reset();
    if (!scanValue) return;

    this.store.confirmReceipt(scanValue);
  }
}
