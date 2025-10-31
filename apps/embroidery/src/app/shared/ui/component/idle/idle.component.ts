import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TranslateModule } from '@ngx-translate/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { IdleStore } from './idle.store';
import { provideComponentStore } from '@ngrx/component-store';

@Component({
  selector: 'app-idle',
  standalone: true,
  imports: [CommonModule, NzSpinModule, TranslateModule],
  providers: [provideComponentStore(IdleStore)],
  template: `
    <div
      class="tw:fixed tw:left-1/2 tw:translate-x-[-50%] tw:py-1 tw:px-2 tw:bg-[#001529] tw:z-[100] tw:text-white"
      [@insertRemoveTrigger]="$isCountdownVisible() ? 'show' : 'hide'">
      <nz-spin nzSimple nzSize="small" class="tw:inline-block tw:mr-3 tw:text-white"></nz-spin>
      <span>{{ 'AUTOMATICALLY_SIGN_OUT_IN' | translate }} {{ $countdown() }}</span>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .ant-spin-dot-item {
        background-color: white;
      }
    `,
  ],
  animations: [
    trigger('insertRemoveTrigger', [
      state(
        'show',
        style({
          top: 0,
        })
      ),
      state(
        'hide',
        style({
          top: '-50px',
        })
      ),
      transition('show <=> hide', animate(200)),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdleComponent {
  $countdown = this._idleStore.$countdown;
  $isCountdownVisible = this._idleStore.$isCountdownVisible;

  constructor(private readonly _idleStore: IdleStore) {}
}
