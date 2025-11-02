import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { Observable } from 'rxjs';
import { PrintLeadLocalStorageStore } from '../data-access/store/print-lead-local-storage.store';
import { PrintLeadStore } from '../data-access/store/print-lead.store';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-print-lead-factory',
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
      <form nz-form [formGroup]="prStore.factoryForm">
        <section class="tw-w-full">
          <nz-form-item class="tw-mb-0">
            <nz-form-label nzRequired class="tw-font-semibold">{{ 'PRINT_LEAD.UI.FACTORY' | translate }}</nz-form-label>
            <nz-form-control>
              <nz-select [formControl]="prStore.factoryForm.controls.factoryId" nzShowSearch>
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
export class PrintLeadFactoryComponent implements OnInit {
  @Input() prStore!: PrintLeadStore;
  @Input() authStore!: AuthStore;
  @Input() stStore!: PrintLeadLocalStorageStore;
  @Output() clickSubmit = new EventEmitter<void>();

  factoryData$!: Observable<UserFactoriesGetApi.Response>;

  constructor(private readonly _nzModalRef: NzModalRef) {}

  ngOnInit(): void {
    this.factoryData$ = this.prStore.select(s => s.factoriesData);
  }

  onSubmit() {
    this.stStore.setSelectedFactory(this.prStore.factoryForm.controls.factoryId.value);
    this.clickSubmit.emit();
  }

  onDestroyModal() {
    this._nzModalRef.destroy();
    this.stStore.removeSelectedFactory();
    this.authStore.signOut();
  }
}
