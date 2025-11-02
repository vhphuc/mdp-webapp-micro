import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Observable } from 'rxjs';
import { WashingLocalStorageStore } from '../data-access/store/washing-local-storage.store';
import { WashingStore } from '../data-access/store/washing.store';
import { AuthStore } from 'src/app/auth/auth.store';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';

@Component({
  selector: 'app-washing-station',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzModalModule,
    NzButtonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSelectModule,
    TranslateModule,
    NzIconModule,
  ],
  template: `
    <ng-container>
      <form nz-form [formGroup]="wStore.stationForm">
        <section class="tw-w-full">
          <nz-form-item class="tw-mb-0">
            <nz-form-label nzRequired class="tw-font-semibold">{{ 'WASHING.UI.STATION' | translate }}</nz-form-label>
            <nz-form-control [nzErrorTip]="productIdErrorTpl">
              <nz-select [formControl]="wStore.stationForm.controls.stationId" nzShowSearch>
                <nz-option
                  *ngFor="let option of stationData$ | async; index as i"
                  [nzLabel]="option.stationName"
                  [nzValue]="option.id"></nz-option>
              </nz-select>
              <ng-template #productIdErrorTpl let-control>
                <ng-container *ngIf="control.hasError('required')">{{ 'WASHING.UI.FIELD_IS_REQUIRED' | translate }} </ng-container>
              </ng-template>
            </nz-form-control>
          </nz-form-item>
        </section>
      </form>
    </ng-container>
    <div *nzModalFooter>
      <button nz-button nzType="default" (click)="onDestroyModal()">
        {{ 'CANCEL' | translate }}
      </button>
      <button nz-button nzType="primary" (click)="onSubmit()" [disabled]="wStore.stationForm.invalid">
        {{ 'OK' | translate }}
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WashingStationComponent implements OnInit {
  @Input() wStore!: WashingStore;
  @Input() authStore!: AuthStore;
  @Input() stStore!: WashingLocalStorageStore;
  @Output() clickSubmit = new EventEmitter<void>();

  stationData$!: Observable<StationsGetApi.Response>;

  constructor(private readonly _nzModalRef: NzModalRef) {}

  ngOnInit(): void {
    this.stationData$ = this.wStore.select(s => s.stationsData);
  }

  onSubmit() {
    this.stStore.setSelectedStation(this.wStore.stationForm.controls.stationId.value);
    this.stStore.setSelectedFactory(this.wStore.factoryForm.controls.factoryId.value);
    this.wStore.stationSetName();
    this.wStore.factorySetName();
    this.clickSubmit.emit();
  }

  onDestroyModal() {
    this._nzModalRef.destroy();
    this.stStore.removeSelectedFactory();
    this.stStore.removeSelectedStation();
    this.authStore.signOut();
  }
}
