import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { defer, map, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { catchError } from 'rxjs/operators';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadViewRejectsModalComponent } from './ui/component/qa-lead-view-rejects-modal.component';
import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { QaViewRejectsApi } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { QaApiService } from './data-access/qa-api.service';

@Component({
  selector: 'app-qa-lead-rejected-message',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzTypographyModule, TranslateModule, NzButtonModule],
  providers: [TranslatePipe],
  template: `
    <div nz-row class="tw-my-2" *ngIf="$stepOdu().scanningOrderDetailUnit!.rejectedCount">
      <div nz-col nzSpan="20" nzOffset="4" class="tw-flex tw-items-center tw-gap-2">
        <span nz-typography nzType="danger" class="tw-text-2xl tw-font-bold">
          {{ 'QA.QA_HAS_REJECTED_THIS_ITEM_{COUNT}_TIMES' | translate: { count: $stepOdu().scanningOrderDetailUnit!.rejectedCount } }}
        </span>
        <button nz-button nzType="default" (click)="openViewRejectModal()">{{ 'QA.VIEW_REJECTS' | translate }}</button>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadRejectedMessageComponent {
  qaLeadStore = inject(QaLeadStore);
  $stepOdu = this.qaLeadStore.selectSignal(s => {
    return s.scanItemResp!.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit)!;
  });

  // defer: create new request each time anywhere subscribed
  rejectHistories = defer(() => {
    return this._qaApiSvc.viewRejects(this.qaLeadStore.$currBarcode()!).pipe(
      map(resp => resp.data!),
      catchError(() => of(<QaViewRejectsApi.Response>[]))
    );
  });

  constructor(
    private readonly _qaApiSvc: QaApiService,
    private readonly _nzModalSvc: NzModalService,
    private readonly _translatePipe: TranslatePipe
  ) {}

  openViewRejectModal() {
    const modalRef = this._nzModalSvc.create({
      nzTitle: this._translatePipe.transform('QA.REJECT_HISTORIES'),
      nzContent: QaLeadViewRejectsModalComponent,
      nzWidth: '60%',
    });

    modalRef.componentInstance!.rejectHistories = this.rejectHistories;
    modalRef.componentInstance!.isEmbroideredPrint = this.qaLeadStore.state().scanItemResp!.isEmbroideredPrint;
  }
}
