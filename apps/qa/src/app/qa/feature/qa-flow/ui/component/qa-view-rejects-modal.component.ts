import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { NzImageModule, NzImageService } from 'ng-zorro-antd/image';
import { PluckPipe } from '@shared/ui/pipe/pluck.pipe';
import { QaViewRejectsApi } from '../../data-access/qa-api';

@Component({
  selector: 'app-qa-view-rejects-modal',
  standalone: true,
  imports: [CommonModule, NzModalModule, NzButtonModule, NzImageModule, PluckPipe, TranslateModule],
  template: ` <div>
      <table class="tw-w-full rejected-history-table" border="1">
        <thead>
          <th class="tw-text-left">{{ 'QA.REASON' | translate }}</th>
          @if (!isEmbroideredPrint) {
            <th class="tw-text-left">{{ 'QA.PRINTED_ON' | translate }}</th>
            <th class="tw-text-left">{{ 'QA.PRINTED_BY' | translate }}</th>
            <th class="tw-text-left">{{ 'QA.PRINT_DATE' | translate }}</th>
          }
          <th class="tw-text-left">{{ 'QA.QA_ON' | translate }}</th>
          <th class="tw-text-left">{{ 'QA.QA_BY' | translate }}</th>
          <th class="tw-text-left">{{ 'QA.QA_DATE' | translate }}</th>
        </thead>
        <tbody>
          <ng-container *ngFor="let rejectHistory of rejectHistories | async">
            <tr>
              <td>{{ rejectHistory.rejectReason }}</td>
              @if (!isEmbroideredPrint) {
                <td>{{ rejectHistory.printStationName }}</td>
                <td>{{ rejectHistory.printedBy }}</td>
                <td>{{ rejectHistory.printedOnUtc | date: 'MM/dd/yyyy' }}</td>
              }
              <td>{{ rejectHistory.qaStation }}</td>
              <td>{{ rejectHistory.qaBy }}</td>
              <td>{{ rejectHistory.qaOnUtc | date: 'MM/dd/yyyy' }}</td>
            </tr>
            <!-- note: Embroidered Item does not have qualityResultRejectHistoryModel -->
            <ng-container *ngIf="rejectHistory.qualityResultRejectHistoryModel">
              <tr class="tw-bg-gray-100">
                <td class="tw-text-center tw-font-semibold">{{ 'QA.AQC' | translate }}</td>
                <td class="tw-text-right tw-font-semibold">{{ 'QA.RESULT' | translate }}:</td>
                <td class="tw-text-red-500 tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 0 : 'issueType' }}
                </td>
                <td class="tw-text-red-500 tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 1 : 'issueType' }}
                </td>
                <td class="tw-text-red-500 tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 2 : 'issueType' }}
                </td>
                <td class="tw-text-red-500 tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 3 : 'issueType' }}
                </td>
                <td class="tw-text-red-500 tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 4 : 'issueType' }}
                </td>
              </tr>
              <tr class="tw-bg-gray-100">
                <td class="tw-text-center tw-font-semibold">
                  <span
                    class="tw-underline tw-cursor-pointer"
                    (click)="onImagePreview(rejectHistory.qualityResultRejectHistoryModel.imageUrl)">
                    {{ 'QA.IMAGE' | translate }}
                  </span>
                </td>
                <td class="tw-text-right tw-font-semibold">{{ 'QA.EXPECTED' | translate }}:</td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 0 : 'expectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 1 : 'expectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 2 : 'expectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 3 : 'expectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 4 : 'expectedValue' }}
                </td>
              </tr>
              <tr class="tw-bg-gray-100">
                <td class="tw-text-center tw-font-semibold">
                  {{ 'QA.TIME' | translate }}: {{ rejectHistory.qualityResultRejectHistoryModel.resultCreatedOnUtc }}
                </td>
                <td class="tw-text-right tw-font-semibold">{{ 'QA.DETECTED' | translate }}:</td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 0 : 'detectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 1 : 'detectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 2 : 'detectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 3 : 'detectedValue' }}
                </td>
                <td class="tw-text-center tw-font-semibold">
                  {{ rejectHistory.qualityResultRejectHistoryModel.qualityItemRejectHistoryModels | appPluck: 4 : 'detectedValue' }}
                </td>
              </tr>
            </ng-container>
          </ng-container>
        </tbody>
      </table>
    </div>
    <div *nzModalFooter>
      <button nz-button nzType="primary" (click)="onOk()">
        {{ 'OK' | translate }}
      </button>
    </div>`,
  styles: [
    `
      .rejected-history-table th,
      .rejected-history-table td {
        padding: 0.25rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaViewRejectsModalComponent {
  @Input({ required: true }) rejectHistories!: Observable<QaViewRejectsApi.Response>;
  @Input({ required: true }) isEmbroideredPrint = false;

  constructor(
    private readonly _nzModalRef: NzModalRef,
    private readonly _nzImageService: NzImageService
  ) {}

  onImagePreview(src: string) {
    this._nzImageService.preview([{ src }]);
  }

  onOk() {
    this._nzModalRef.destroy();
  }
}
