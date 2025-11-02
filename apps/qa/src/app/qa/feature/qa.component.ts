import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaFlowComponent } from './qa-flow/qa-flow.component';
import { QaStickerFlowComponent } from './qa-sticker-flow/qa-sticker-flow.component';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';

@Component({
  selector: 'app-qa',
  standalone: true,
  imports: [CommonModule, QaFlowComponent, QaStickerFlowComponent],
  providers: [],
  template: `
    @switch ($currentFlow()) {
      @case ('qa') {
        <app-qa-flow />
      }
      @case ('qa-sticker') {
        <app-qa-sticker-flow />
      }
    }
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaComponent {
  $currentFlow = this._lsStore.selectSignal<'qa' | 'qa-sticker'>(s => {
    const qaConfig = s.qaConfig;
    if (qaConfig && qaConfig.chosenStation.stationType === StationType.QaSticker) {
      return 'qa-sticker';
    }
    return 'qa';
  });

  constructor(private readonly _lsStore: LocalStorageStore) {}
}
