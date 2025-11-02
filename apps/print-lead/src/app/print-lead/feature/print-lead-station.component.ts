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
import { PrintLeadLocalStorageStore } from '../data-access/store/print-lead-local-storage.store';
import { PrintLeadStore } from '../data-access/store/print-lead.store';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-print-lead-station',
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
      <form nz-form [formGroup]="prStore.stationForm">
        <section class="tw-w-full">
          <nz-form-item class="tw-mb-0">
            <nz-form-label nzRequired class="tw-font-semibold">{{ 'NECK_LABEL.STATION' | translate }}</nz-form-label>
            <nz-form-control [nzErrorTip]="productIdErrorTpl">
              <nz-select [formControl]="prStore.stationForm.controls.stationId" nzShowSearch>
                <nz-option
                  *ngFor="let option of stationData$ | async; index as i"
                  [nzLabel]="option.stationName"
                  [nzValue]="option.id"></nz-option>
              </nz-select>
              <ng-template #productIdErrorTpl let-control>
                <ng-container *ngIf="control.hasError('required')">{{ 'NECK_LABEL.FIELD_IS_REQUIRED' | translate }}</ng-container>
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
      <button nz-button nzType="primary" (click)="onSubmit()" [disabled]="prStore.stationForm.invalid">
        {{ 'OK' | translate }}
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintLeadStationComponent implements OnInit {
  @Input() prStore!: PrintLeadStore;
  @Input() authStore!: AuthStore;
  @Input() stStore!: PrintLeadLocalStorageStore;
  @Output() clickSubmit = new EventEmitter<void>();

  stationData$!: Observable<StationsGetApi.Response>;

  constructor(private readonly _nzModalRef: NzModalRef) {}

  ngOnInit(): void {
    this.stationData$ = this.prStore.select(s => s.stationsData);
  }

  onSubmit() {
    this.stStore.setSelectedStation(this.prStore.stationForm.controls.stationId.value);
    this.stStore.setSelectedFactory(this.prStore.factoryForm.controls.factoryId.value);
    this.prStore.stationSetName();
    this.prStore.factorySetName();
    this.clickSubmit.emit();
  }

  onDestroyModal() {
    this._nzModalRef.destroy();
    this.stStore.removeSelectedFactory();
    this.stStore.removeSelectedStation();
    this.authStore.signOut();
  }
}
