import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { EmbroideryStore } from '../embroidery.store';
import { EmbroideryService } from '../embroidery.service';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { EmbroideryAppConfirmType } from '../embroidery.model';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';

@Component({
  selector: 'app-step-confirm-item',
  standalone: true,
  imports: [
    TranslateModule,
    UpperCasePipe,
    ReactiveFormsModule,
    NzTypographyModule,
    ImageErrorUrlDirective,
    NzInputModule,
    KeepFocusDirective,
  ],
  template: `
    <div class="tw:h-full tw:flex tw:flex-col">
      <div class="tw:flex tw:gap-6">
        <div class="tw:w-1/2">
          <div class="tw:flex tw:items-center tw:gap-8">
            <div class="tw:font-semibold tw:text-xl tw:text-right">
              <label for="scan-item-input">{{ 'NECK_LABEL.CONFIRM_ITEM' | translate | uppercase }}</label>
            </div>
            <div class="tw:flex-1">
              <input
                id="confirm-item-input"
                type="text"
                nz-input
                [formControl]="scanControl"
                nzSize="large"
                [placeholder]="'NECK_LABEL.CONFIRM_ITEM_PLACEHOLDER' | translate"
                appKeepFocus
                focusOnInitOnly
                (keyup.enter)="onScan()" />
            </div>
          </div>
        </div>
        <div class="tw:flex-1">
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
export class StepConfirmItemComponent {
  store = inject(EmbroideryStore);
  item = this.store.item;
  scanMsg = this.store.scanMsg;

  scanControl = new FormControl('', { nonNullable: true });

  constructor(
    private readonly _apiSvc: EmbroideryService,
    private readonly _lsStore: LocalStorageStore
  ) {}

  onScan() {
    const scanValue = this.scanControl.value.trim().toUpperCase();
    this.scanControl.reset();

    if (!scanValue) return;

    this.scanMsg.set(null);

    const matchConfirmBarcode = this.item()!.listReviewBarcodeConfirm.find(bc => bc.barcode.toUpperCase() === scanValue.toUpperCase());
    if (!matchConfirmBarcode) {
      this.scanMsg.set({ key: 'CONFIRMATION_BARCODE_X1_IS_INVALID', params: { x1: scanValue }, color: 'red' });
      return;
    }

    const barcode = this.item()!.barcode;
    const factoryId = this._lsStore.getEmbroideryConfig()!.factory.id;
    const stationId = this._lsStore.getEmbroideryConfig()!.station.id;
    const stationName = this._lsStore.getEmbroideryConfig()!.station.stationName;
    const confirmBarcode = matchConfirmBarcode.barcode;

    this._apiSvc.confirmItem({ barcode, factoryId, stationId, stationName, confirmBarcode }).subscribe({
      next: resp => {
        if (!resp.data) return;

        this.item.update(nullableItem => {
          const item = nullableItem!;
          item.status = resp.data!.status;
          item.statusName = resp.data!.statusName;
          return { ...item };
        });
        this.store.step.set('scan-item');
        this.scanMsg.set({
          key: resp.message,
          params: resp.paramSuccess,
          color: matchConfirmBarcode.confirmType === EmbroideryAppConfirmType.Accept ? 'green' : 'red',
        });
      },
      error: (err: ErrorResult) => {
        this.scanMsg.set({ key: err.errorKey, params: err.paramError, color: 'red' });
      },
    });
  }
}
