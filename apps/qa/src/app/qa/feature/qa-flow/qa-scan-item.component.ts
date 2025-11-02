import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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
import { extractJitItemBarcode, extractMugBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { StationType } from '@shared/data-access/model/api/enum/station-type';

@Component({
  selector: 'app-qa-scan-item',
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
      <app-qa-scan-control-error />
      <div nz-row *ngIf="$apiStepMsg()" class="tw-mt-4">
        <div nz-col nzSpan="22" nzOffset="2" class="tw-text-center">
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
export class QaScanItemComponent {
  qaStore = inject(QaStore);
  $apiStepMsg = this.qaStore.$apiStepMsg;
  scanItemControl = new FormControl('', { nonNullable: true });

  $scanItemLabel = computed(() => {
    const qaConfig = this.qaStore.$qaConfig();
    const stationType = qaConfig?.chosenStation?.stationType;
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

    this.qaStore.scanItem({ barcode });
  }

  protected readonly QaColor = QaColor;
}
