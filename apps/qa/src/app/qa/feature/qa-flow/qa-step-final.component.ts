import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { QaStore } from './data-access/qa.store';
import { QaScanItemApi } from './data-access/qa-api';
import { QaColor } from '../../data-access/model/common/enum/qa-color';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { extractJitItemBarcode, extractMugBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { StationType } from '@shared/data-access/model/api/enum/station-type';

@Component({
  selector: 'app-qa-step-final',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
    ImageErrorUrlDirective,
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
export class QaStepFinalComponent {
  qaStore = inject(QaStore);
  scanItemControl = new FormControl('', { nonNullable: true });
  $stepFinal = this.qaStore.$currentScanStep as Signal<QaScanItemApi.QaScanStep>; // cast non null bcz not nullable in here

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
