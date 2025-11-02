import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaLeadStore } from './qa-lead-flow/data-access/qa-lead.store';
import { provideComponentStore } from '@ngrx/component-store';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { QaLeadFlowComponent } from './qa-lead-flow/qa-lead-flow.component';
import { QaLeadStickerFlowComponent } from './qa-lead-sticker-flow/qa-lead-sticker-flow.component';

@Component({
  selector: 'app-qa-lead',
  standalone: true,
  imports: [CommonModule, QaLeadFlowComponent, QaLeadStickerFlowComponent],
  providers: [provideComponentStore(QaLeadStore)],
  template: `
    <ng-container [ngSwitch]="$currentFlow()">
      <app-qa-lead-flow *ngSwitchCase="'qa'" />
      <app-qa-lead-sticker-flow *ngSwitchCase="'qa-sticker'" />
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadComponent {
  $currentFlow = this._lsStore.selectSignal<'qa' | 'qa-sticker'>(s => {
    const qaLeadConfig = s.qaLeadConfig;
    if (!qaLeadConfig?.station) return 'qa';
    if (qaLeadConfig.station.stationType === StationType.QaSticker) {
      return 'qa-sticker';
    }
    return 'qa';
  });

  constructor(private readonly _lsStore: LocalStorageStore) {}
}
