import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaColor } from 'src/app/qa-lead/data-access/model/common/enum/qa-color';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadScanControlErrorComponent } from './ui/component/qa-lead-scan-control-error.component';
import { extractJitItemBarcode, extractMugBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { StationType } from '@shared/data-access/model/api/enum/station-type';

@Component({
  selector: 'app-qa-lead-scan-item',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
    QaLeadScanControlErrorComponent,
  ],
  template: `
    <div>
      <div class="tw-flex tw-items-center tw-gap-8">
        <label for="scan-item-input" class="tw-font-semibold tw-text-xl tw-whitespace-nowrap tw-flex-shrink-0">{{ $scanItemLabel() | translate }}</label>
        <input
          type="text"
          nz-input
          id="scan-item-input"
          nzSize="large"
          [placeholder]="'QA.ITEM_#' | translate"
          [formControl]="scanItemControl"
          (keyup.enter)="scanItem()"
          appKeepFocus
          focusOnInitOnly
          class="tw-max-w-md" />
      </div>
      <app-qa-lead-scan-control-error />
      <div nz-row *ngIf="$apiStepMsg()" class="tw-mt-4">
        <div nz-col nzSpan="16" nzOffset="4" class="tw-text-center">
          <span
            nz-typography
            [nzType]="$apiStepMsg()!.messageColor === QaColor.Red ? 'danger' : 'success'"
            class="tw-text-5xl tw-font-bold tw-leading-normal tw-whitespace-pre-line"
            >{{ $apiStepMsg()!.message | translate: $apiStepMsg()!.messageParams }}</span
          >
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadScanItemComponent {
  qaLeadStore = inject(QaLeadStore);
  $apiStepMsg = this.qaLeadStore.$apiStepMsg;
  scanItemControl = new FormControl('', { nonNullable: true });

  $scanItemLabel = computed(() => {
    const station = this.qaLeadStore.station();
    const stationType = station?.stationType;
    return stationType === StationType.QaSock ? 'QA.SCAN_HANGER_ITEM' : 'QA.SCAN_ITEM';
  });



  scanItem() {
    const scanValue = this.scanItemControl.value.trim().toUpperCase();
    this.scanItemControl.reset();
    if (!scanValue) return;

    let barcode = '';
    if (scanValue.startsWith('MUG')) {
      barcode = extractMugBarcode(scanValue);
    } else if (scanValue.startsWith('JIT')) {
      barcode = extractJitItemBarcode(scanValue);
    } else {
      barcode = extractUnitBarcode(scanValue);
    }

    this.qaLeadStore.scanItem({ barcode });
  }

  protected readonly QaColor = QaColor;
}
