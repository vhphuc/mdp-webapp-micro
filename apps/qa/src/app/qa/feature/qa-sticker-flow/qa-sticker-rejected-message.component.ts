import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { defer, map, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { catchError } from 'rxjs/operators';
import { QaStickerStore } from './data-access/qa-sticker.store';
import { QaStickerScanSheetApi, QaStickerViewRejectsApi } from './data-access/qa-sticker-api';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaStickerApiService } from './data-access/qa-sticker-api.service';
import { QaStickerViewRejectsModalComponent } from './ui/component/qa-sticker-view-rejects-modal.component';

@Component({
  selector: 'app-qa-sticker-rejected-message',
  standalone: true,
  imports: [CommonModule, NzTypographyModule, TranslateModule, NzButtonModule],
  providers: [TranslatePipe],
  template: `
    <div class="tw-mb-4 tw-flex tw-gap-6" *ngIf="$stickerGroup().rejectedCount">
      <div class="tw-w-1/6"></div>
      <div class="tw-flex-1 tw-flex tw-items-center tw-gap-2">
        <span nz-typography nzType="danger" class="tw-text-2xl tw-font-bold">
          {{ 'QA.QA_HAS_REJECTED_THIS_ITEM_{COUNT}_TIMES' | translate: { count: $stickerGroup().rejectedCount } }}
        </span>
        <button nz-button nzType="default" (click)="openViewRejectModal()">{{ 'QA.VIEW_REJECTS' | translate }}</button>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerRejectedMessageComponent {
  qaStickerStore = inject(QaStickerStore);
  $stickerGroup: Signal<QaStickerScanSheetApi.QaStickerStepStickerGroup['scanningStickerGroup']> = this.qaStickerStore.selectSignal(
    this.qaStickerStore.selectSignal(s => s),
    this.qaStickerStore.$currGroupBarcode,
    (state, currStickerGroupBarcode) => {
      return state.sheet!.steps.find(
        (st): st is QaStickerScanSheetApi.QaStickerStepStickerGroup =>
          st.groupType === QaStepGroup.StickerGroup && st.scanningStickerGroup.barcode === currStickerGroupBarcode
      )!.scanningStickerGroup;
    }
  );

  // defer: create new request each time anywhere subscribed
  rejectHistories = defer(() => {
    const sheetBarcode = this.qaStickerStore.selectSignal(s => s.sheet!.sheetBarcode)();
    return this._qaStkApiSvc.viewRejects(sheetBarcode, this.$stickerGroup().barcode).pipe(
      map(resp => resp.data!),
      catchError(() => of(<QaStickerViewRejectsApi.Response>[]))
    );
  });

  constructor(
    private readonly _qaStkApiSvc: QaStickerApiService,
    private readonly _nzModalSvc: NzModalService,
    private readonly _translatePipe: TranslatePipe
  ) {}

  openViewRejectModal() {
    const modalRef = this._nzModalSvc.create({
      nzTitle: this._translatePipe.transform('QA.REJECT_HISTORIES'),
      nzContent: QaStickerViewRejectsModalComponent,
      nzWidth: '60%',
    });

    modalRef.componentInstance!.rejectHistories = this.rejectHistories;
  }
}
