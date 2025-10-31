import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { EmbroideryStore } from '../embroidery.store';
import { EmbroideryService } from '../embroidery.service';
import { extractEmbroideryBarcode } from '@shared/util/helper/extract-barcode';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { NzInputModule } from 'ng-zorro-antd/input';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';

@Component({
  selector: 'app-step-scan-item',
  standalone: true,
  imports: [
    TranslateModule,
    UpperCasePipe,
    ReactiveFormsModule,
    NzTypographyModule,
    NzInputModule,
    KeepFocusDirective,
    ImageErrorUrlDirective,
  ],
  template: `
    <div class="tw:h-full tw:flex tw:flex-col">
      <div class="tw:flex tw:gap-6">
        <div class="tw:w-1/2">
          <div class="tw:flex tw:items-center tw:gap-8">
            <div class="tw:font-semibold tw:text-xl tw:text-right">
              <label for="scan-item-input">{{ 'NECK_LABEL.SCAN_ITEM' | translate | uppercase }}</label>
            </div>
            <div class="tw:flex-1">
              <input
                id="scan-item-input"
                type="text"
                nz-input
                [formControl]="scanItemControl"
                nzSize="large"
                [placeholder]="'NECK_LABEL.ITEM' | translate"
                appKeepFocus
                focusOnInitOnly
                (keyup.enter)="onScanItem()" />
            </div>
          </div>
        </div>
        <div class="tw:w-1/2 tw:max-w-1/2">
          @if (scanMsg()) {
            <span
              nz-typography
              [nzType]="scanMsg()!.color === 'red' ? 'danger' : 'success'"
              class="tw:text-2xl tw:font-bold tw:whitespace-pre-line"
              [innerHTML]="scanMsg()!.key | translate: scanMsg()!.params"></span>
          }
        </div>
      </div>
      @if (item()) {
        <div class="tw:text-center tw:my-2 tw:text-xl">
          <span class="tw:font-semibold">{{ 'NECK_LABEL.ITEM_STATUS' | translate }}: </span>
          <span> {{ item()!.statusName | uppercase }}</span>
        </div>
        <div class="tw:border tw:border-solid tw:flex-1 tw:p-1">
          <div class="tw:h-full tw:image-fill">
            <img [src]="item()!.embFileUrl" appImageErrorUrl />
          </div>
        </div>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepScanItemComponent {
  store = inject(EmbroideryStore);
  item = this.store.item;
  scanMsg = this.store.scanMsg;

  scanItemControl = new FormControl('', { nonNullable: true });

  constructor(
    private readonly _apiSvc: EmbroideryService,
    private readonly _lsStore: LocalStorageStore
  ) {}

  onScanItem() {
    const scanValue = this.scanItemControl.value.trim().toUpperCase();
    this.scanItemControl.reset();

    if (!scanValue) return;

    this.scanMsg.set(null);

    const barcode = extractEmbroideryBarcode(scanValue);
    const factoryId = this._lsStore.getEmbroideryConfig()!.factory.id;
    const stationId = this._lsStore.getEmbroideryConfig()!.station.id;
    const stationName = this._lsStore.getEmbroideryConfig()!.station.stationName;

    this._apiSvc.scanItemConfirmed({ barcode, factoryId, stationId, stationName }).subscribe({
      next: resp => {
        if (!resp.data) return;
        this.item.set(resp.data);
        this.scanMsg.set({ key: resp.message, params: resp.paramSuccess, color: 'green' });
      },
      error: (err: ErrorResult) => {
        this.item.set(null);
        this.scanMsg.set({ key: err.errorKey, params: err.paramError, color: 'red' });
      },
    });
  }
}
