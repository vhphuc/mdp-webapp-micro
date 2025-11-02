import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QaStore } from './data-access/qa.store';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzQRCodeModule } from 'ng-zorro-antd/qr-code';
import { QaRejectedMessageComponent } from './qa-rejected-message.component';
import { OnlyNumberInputDirective } from '@shared/ui/directive/only-number-input.directive';
import { QaScanControlErrorComponent } from './ui/component/qa-scan-control-error.component';

@Component({
  selector: 'app-qa-step-size',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    NgOptimizedImage,
    KeepFocusDirective,
    NzQRCodeModule,
    QaRejectedMessageComponent,
    OnlyNumberInputDirective,
    QaScanControlErrorComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full ">
      <div nz-row nzGutter="30">
        <div nz-col nzSpan="4" class="tw-text-right">
          <label for="scan-size-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_SIZE' | translate }}</label>
        </div>
        <div nz-col nzSpan="8">
          <input
            type="text"
            nz-input
            id="scan-size-input"
            nzSize="large"
            [formControl]="scanSizeControl"
            (keyup.enter)="scanSize()"
            appOnlyNumber
            appKeepFocus
            focusOnInitOnly />
        </div>
      </div>
      <app-qa-scan-control-error />
      <app-qa-rejected-message />

      <div class="tw-border tw-border-black tw-border-solid tw-flex-1 tw-p-5">
        <div nz-row [nzGutter]="[0, 16]">
          <div nz-col nzSpan="6" *ngFor="let size of $sizes()">
            <div
              class="tw-flex tw-flex-col tw-items-center tw-justify-between tw-cursor-pointer hover:tw-border hover:tw-border-black hover:tw-border-solid"
              (click)="clickSize(size.id)">
              <span class="tw-font-semibold tw-text-2xl">{{ size.name }}</span>
              <nz-qrcode [nzValue]="size.id.toString()"></nz-qrcode>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStepSizeComponent {
  scanSizeControl = new FormControl('', { nonNullable: true });
  $sizes = this._qaStore.selectSignal(s => s.scanItemResp?.sizes);

  constructor(private readonly _qaStore: QaStore) {}

  scanSize() {
    this._qaStore.scanSize({ sizeId: +this.scanSizeControl.value });
  }

  clickSize(sizeId: number) {
    this._qaStore.scanSize({ sizeId });
  }
}
