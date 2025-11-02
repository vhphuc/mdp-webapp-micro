import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { extractJitItemBarcode, extractMugBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { QaColor } from 'src/app/qa-lead/data-access/model/common/enum/qa-color';
import { QaScanItemApi } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { QaLeadStore } from './data-access/qa-lead.store';
import QaScanStep = QaScanItemApi.QaScanStep;

@Component({
  selector: 'app-qa-lead-step-final',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
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
      <div class="tw-text-center tw-mt-[15%]">
        @if ($stepFinal().messages?.length) {
          @for (msg of $stepFinal().messages; track msg) {
            <div>
              <span
                nz-typography
                [nzType]="msg.messageColor === QaColor.Green ? 'success' : 'danger'"
                class="tw-font-bold tw-text-5xl tw-leading-normal tw-whitespace-pre-line"
                >{{ msg.message | translate: $stepFinal().finalStepMessageParams }}</span
              >
            </div>
          }
        } @else {
          <span
            nz-typography
            [nzType]="$stepFinal().messageColor === QaColor.Green ? 'success' : 'danger'"
            class="tw-font-bold tw-text-5xl tw-leading-normal tw-whitespace-pre-line"
            >{{ $stepFinal().message! | translate: $stepFinal().finalStepMessageParams }}</span
          >
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStepFinalComponent {
  qaLeadStore = inject(QaLeadStore);
  scanItemControl = new FormControl('', { nonNullable: true });
  $stepFinal = this.qaLeadStore.$currentScanStep as Signal<QaScanStep>; // cast non null bcz not nullable in here

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
