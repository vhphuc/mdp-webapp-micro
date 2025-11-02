import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { QaStore } from './data-access/qa.store';
import { TranslateModule } from '@ngx-translate/core';
import { QaColor } from '../../data-access/model/common/enum/qa-color';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaScanControlErrorComponent } from './ui/component/qa-scan-control-error.component';
import { extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';

@Component({
  selector: 'app-qa-step-confirm-pick-ticket',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
    QaScanControlErrorComponent,
  ],
  template: `
    <div>
      <div nz-row nzGutter="30">
        <div nz-col nzFlex="300px" class="tw-text-right">
          <label for="scan-confirm-pick-ticket-input" class="tw-font-semibold tw-text-xl">{{ '_CONFIRM_PICK_TICKET' | translate }}</label>
        </div>
        <div nz-col nzFlex="auto">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="scan-confirm-pick-ticket-input"
            nzSize="large"
            [placeholder]="'_CONFIRM_PICK_TICKET' | translate"
            [formControl]="scanItemControl"
            (keyup.enter)="scanItem()"
            appKeepFocus
            focusOnInitOnly />
        </div>
      </div>
      <app-qa-scan-control-error />
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStepConfirmPickTicketComponent implements OnInit {
  qaStore = inject(QaStore);
  scanItemControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.qaStore.printPickTicket();
  }

  scanItem() {
    const scanValue = this.scanItemControl.value.trim().toUpperCase();
    this.scanItemControl.reset();
    if (!scanValue) return;

    this.qaStore.resetMsg();

    let scanBarcode = extractUnitBarcode(scanValue);

    if (scanBarcode !== this.qaStore.$currBarcode()) {
      this.qaStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanBarcode },
        },
      });
      return;
    }

    this.qaStore.patchState(s => {
      const stepConfirmPickTicket = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.ConfirmPickTicket);
      if (stepConfirmPickTicket) {
        stepConfirmPickTicket.isScanned = true;
      }
      return { ...s };
    })
  }

  protected readonly QaColor = QaColor;
}
