import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { QaStickerViewRejectsApi } from '../../data-access/qa-sticker-api';

@Component({
  selector: 'app-qa-sticker-view-rejects-modal',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule, TranslateModule],
  template: `
    <div>
      <table class="tw-w-full">
        <thead>
          <th class="tw-border tw-border-black tw-border-solid tw-p-2 tw-text-left">{{ 'QA.REASON' | translate }}</th>
          <th class="tw-border tw-border-black tw-border-solid tw-p-2 tw-text-left">{{ 'QA.PRINTED_ON' | translate }}</th>
          <th class="tw-border tw-border-black tw-border-solid tw-p-2 tw-text-left">{{ 'QA.PRINTED_BY' | translate }}</th>
          <th class="tw-border tw-border-black tw-border-solid tw-p-2 tw-text-left">{{ 'QA.PRINT_DATE' | translate }}</th>
          <th class="tw-border tw-border-black tw-border-solid tw-p-2 tw-text-left">{{ 'QA.QA_ON' | translate }}</th>
          <th class="tw-border tw-border-black tw-border-solid tw-p-2 tw-text-left">{{ 'QA.QA_BY' | translate }}</th>
          <th class="tw-border tw-border-black tw-border-solid tw-p-2 tw-text-left">{{ 'QA.QA_DATE' | translate }}</th>
          <th></th>
        </thead>
        <tbody>
          <tr *ngFor="let rejectHistory of rejectHistories | async">
            <td class="tw-border tw-border-black tw-border-solid tw-p-2">{{ rejectHistory.rejectReason }}</td>
            <td class="tw-border tw-border-black tw-border-solid tw-p-2">{{ rejectHistory.printStationName }}</td>
            <td class="tw-border tw-border-black tw-border-solid tw-p-2">{{ rejectHistory.printedBy }}</td>
            <td class="tw-border tw-border-black tw-border-solid tw-p-2">{{ rejectHistory.printedOnUtc | date: 'MM/dd/yyyy' }}</td>
            <td class="tw-border tw-border-black tw-border-solid tw-p-2">{{ rejectHistory.qaStation }}</td>
            <td class="tw-border tw-border-black tw-border-solid tw-p-2">{{ rejectHistory.qaBy }}</td>
            <td class="tw-border tw-border-black tw-border-solid tw-p-2">{{ rejectHistory.qaOnUtc | date: 'MM/dd/yyyy' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div *nzModalFooter>
      <button nz-button nzType="primary" (click)="onOk()">
        {{ 'OK' | translate }}
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerViewRejectsModalComponent {
  @Input({ required: true }) rejectHistories!: Observable<QaStickerViewRejectsApi.Response>;

  constructor(private readonly _nzModalRef: NzModalRef) {}

  onOk() {
    this._nzModalRef.destroy();
  }
}
