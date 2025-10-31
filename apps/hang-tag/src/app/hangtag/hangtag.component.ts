import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { NgIf, UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HangtagStore } from './hangtag.store';
import { HangtagBreadcrumbComponent } from './ui/hangtag-breadcrumb.component';
import { HangtagConfigComponent } from './ui/hangtag-config.component';
import { HangtagService } from './hangtag.service';
import { HangtagItemInfoComponent } from './ui/hangtag-item-info.component';
import { HangtagLocationAttributesComponent } from './ui/hangtag-location-attributes.component';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HangtagInsertAttributesComponent } from './ui/hangtag-insert-attributes.component';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { ScanBarcode } from './hangtag.model';
import { openPrintingPopup } from '@shared/ui/component/printing-popup';
import { NzModalService } from 'ng-zorro-antd/modal';
import { extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { openPrintShipLabelFailedModal } from '@shared/ui/component/print-ship-label-failed-modal';

@Component({
  selector: 'app-hangtag',
  standalone: true,
  imports: [
    TranslateModule,
    AppLayoutComponent,
    HangtagBreadcrumbComponent,
    HangtagConfigComponent,
    HangtagItemInfoComponent,
    HangtagLocationAttributesComponent,
    KeepFocusDirective,
    NgIf,
    NzInputDirective,
    NzTypographyComponent,
    ReactiveFormsModule,
    UpperCasePipe,
    HangtagInsertAttributesComponent,
  ],
  providers: [HangtagStore],
  template: `
    <app-layout [appName]="'Hang Tag'" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #breadcrumbTplRef>
        <app-hangtag-breadcrumb />
      </ng-template>
      <ng-template #configTplRef>
        <app-hangtag-config />
      </ng-template>

      <div class="tw:flex-1 tw:flex tw:gap-6">
        <div class="tw:w-1/3 tw:flex tw:flex-col">
          @if (barcode()) {
            <app-hangtag-item-info [barcode]="barcode()!" />
            <app-hangtag-location-attributes [barcode]="barcode()!" class="tw:flex-1" />
          }
        </div>
        <div class="tw:flex-1 tw:flex tw:flex-col">
          <!-- Scan Input -->
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
            <div class="tw:flex-1">
              <div>
                <span *ngIf="errorMsg() as msg" nz-typography [nzType]="'danger'" class="tw:text-2xl tw:font-bold tw:whitespace-pre-line">{{
                  msg.errorKey | translate: msg.paramError
                }}</span>
              </div>
            </div>
          </div>
          <!-- Main Panel -->
          @if (barcode()) {
            <app-hangtag-insert-attributes [barcode]="barcode()!" class="tw:flex-1" />
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HangtagComponent {
  store = inject(HangtagStore);
  barcode = this.store.barcode;

  factoryId = this._lsStore.selectSignal(s => s.hangtagConfig?.factory.id ?? 0);
  hangtagPrinterId = this._lsStore.selectSignal(s => s.hangtagConfig?.hangtagPrinter.id ?? 0);

  scanItemControl = new FormControl('', { nonNullable: true });
  errorMsg = signal<ErrorResult | null>(null);

  constructor(
    private readonly _apiSvc: HangtagService,
    private readonly _lsStore: LocalStorageStore,
    private readonly _nzModalSvc: NzModalService
  ) {}

  onScanItem() {
    const scanValue = this.scanItemControl.getRawValue().toUpperCase();
    this.scanItemControl.reset();
    if (!scanValue) return;

    this.errorMsg.set(null);

    let barcode = '';

    if (scanValue.startsWith('Q_')) {
      barcode = scanValue;
    } else {
      barcode = extractUnitBarcode(scanValue);
    }

    this._apiSvc.scanBarcode(barcode, this.factoryId(), this.hangtagPrinterId()).subscribe({
      next: resp => {
        this.barcode.set(resp.data!);
        this.printHangtag(this.barcode()!);
      },
      error: (err: ErrorResult) => this.errorMsg.set(err),
    });
  }

  printHangtag(barcode: ScanBarcode.Response) {
    const attr = barcode.insertAttributes[0];

    const printingModalRef = openPrintingPopup(this._nzModalSvc, {
      key: 'SHIPPING.PRINTING_{unitInsertName}',
      params: { unitInsertName: attr.type },
    });

    this._apiSvc.printHangtag(barcode.orderDetailUnitId, attr.orderItemAttributeId, this.factoryId(), this.hangtagPrinterId()).subscribe({
      next: _ => {
        setTimeout(() => printingModalRef.destroy(), 500);
      },
      error: (error: ErrorResult) => {
        printingModalRef.destroy();
        const printHangtagFailedModalRef = openPrintShipLabelFailedModal(
          this._nzModalSvc,
          error.errorKey,
          () => {
            printHangtagFailedModalRef.destroy();
          },
          () => {
            printHangtagFailedModalRef.destroy();
            this.printHangtag(barcode);
          }
        );
      },
    });
  }
}
