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
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { WashingLocalStorageStore } from '../data-access/store/washing-local-storage.store';
import { WashingStore } from '../data-access/store/washing.store';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-washing-factory',
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
      <form nz-form [formGroup]="wStore.factoryForm">
        <section class="tw-w-full">
          <nz-form-item class="tw-mb-0">
            <nz-form-label nzRequired class="tw-font-semibold">{{ 'WASHING.UI.FACTORY' | translate }}</nz-form-label>
            <nz-form-control>
              <nz-select [formControl]="wStore.factoryForm.controls.factoryId" nzShowSearch>
                <nz-option
                  *ngFor="let option of factoryData$ | async; index as i"
                  [nzLabel]="option.name"
                  [nzValue]="option.id"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </section>
      </form>
    </ng-container>
    <div *nzModalFooter>
      <button nz-button nzType="default" (click)="onDestroyModal()">
        {{ 'CANCEL' | translate }}
      </button>
      <button nz-button nzType="primary" (click)="onSubmit()">
        {{ 'OK' | translate }}
      </button>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WashingFactoryComponent implements OnInit {
  @Input() wStore!: WashingStore;
  @Input() authStore!: AuthStore;
  @Input() stStore!: WashingLocalStorageStore;
  @Output() clickSubmit = new EventEmitter<void>();

  factoryData$!: Observable<UserFactoriesGetApi.Response>;

  constructor(private _nzModalRef: NzModalRef) {}

  ngOnInit(): void {
    this.factoryData$ = this.wStore.select(s => s.factoriesData);
  }

  onSubmit() {
    this.stStore.setSelectedFactory(this.wStore.factoryForm.controls.factoryId.value);
    this.clickSubmit.emit();
  }

  onDestroyModal() {
    this._nzModalRef.destroy();
    this.stStore.removeSelectedFactory();
    this.authStore.signOut();
  }
}
