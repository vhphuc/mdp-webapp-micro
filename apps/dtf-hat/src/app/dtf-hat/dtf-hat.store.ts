import { Injectable, signal } from '@angular/core';
import { DtfHatStep, EDtfHatAppConfirmType, ScanTransfer } from './dtf-hat.model';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { DtfHatService } from './dtf-hat.service';
import { openPrintingPopup } from '@shared/ui/component/printing-popup';
import { NzModalService } from 'ng-zorro-antd/modal';

@Injectable()
export class DtfHatStore {
  $step = signal<DtfHatStep>(DtfHatStep.SCAN_TRANSFER);
  $item = signal<ScanTransfer.Response | null>(null);

  $error = signal<ErrorResult | null>(null);
  $config = this._lsStore.selectSignal(s => s.dtfHatConfig);

  $itemConfirmedType = signal<EDtfHatAppConfirmType | null>(null);

  constructor(
    private readonly _lsStore: LocalStorageStore,
    private readonly _apiSvc: DtfHatService,
    private readonly _nzModalSvc: NzModalService
  ) {}

  reset() {
    this.$item.set(null);
    this.$error.set(null);
    this.$step.set(DtfHatStep.SCAN_TRANSFER);
  }

  scanTransfer(barcode: string) {
    this.reset();
    this._apiSvc
      .scanTransfer(barcode, {
        factoryId: this.$config()!.factory.id,
        stationId: this.$config()!.station.id,
        printerConfigurationId: this.$config()!.regularPrinter.id,
      })
      .subscribe({
        next: resp => {
          if (!resp.data) return;
          this.$item.set(resp.data);
          this.$step.set(DtfHatStep.SCAN_ITEM);
          const printingModalRef = openPrintingPopup(this._nzModalSvc, { key: 'PRINTING_PICK_TICKET' });
          setTimeout(() => printingModalRef.destroy(), 2000);
        },
        error: (err: ErrorResult) => {
          this.$error.set(err);
        },
      });
  }

  scanItem(barcode: string) {
    this.$error.set(null);
    this._apiSvc
      .scanItem(barcode, {
        factoryId: this.$config()!.factory.id,
        stationId: this.$config()!.station.id,
        printerConfigurationId: this.$config()!.regularPrinter.id,
      })
      .subscribe({
        next: resp => {
          if (!resp.data) return;
          this.$item.set(resp.data);
          this.$step.set(DtfHatStep.CONFIRM_ITEM);
        },
        error: (err: ErrorResult) => {
          this.$error.set(err);
        },
      });
  }

  confirmItem(confirmBarcode: string, confirmedType: EDtfHatAppConfirmType) {
    this.$error.set(null);
    this._apiSvc
      .scanConfirm({
        factoryId: this.$config()!.factory.id,
        stationId: this.$config()!.station.id,
        barcode: this.$item()!.barcode,
        confirmBarcode,
      })
      .subscribe({
        next: resp => {
          if (!resp.data) return;
          this.$item.update(item => {
            item!.statusDescription = resp.data!;
            return { ...item! };
          });
          this.$itemConfirmedType.set(confirmedType);
          this.$step.set(DtfHatStep.CONFIRM_COMPLETE);
        },
        error: (err: ErrorResult) => {
          this.$error.set(err);
        },
      });
  }
}
