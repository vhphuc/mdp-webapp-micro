import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideComponentStore } from '@ngrx/component-store';
import { QaConfigStore } from '../data-access/store/qa-config.store';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TranslateModule } from '@ngx-translate/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { QaPrintersGetApi, QaStationsGetApi } from '../data-access/model/qa-config-api';
import { QaStore } from './qa-flow/data-access/qa.store';
import { QaStickerStore } from './qa-sticker-flow/data-access/qa-sticker.store';
import { Role } from '@shared/data-access/model/api/enum/role';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-qa-config',
  standalone: true,
  imports: [
    CommonModule,
    NzSpaceModule,
    NzTypographyModule,
    NzIconModule,
    NzDropDownModule,
    NzMenuModule,
    TranslateModule,
    NzModalModule,
    NzSelectModule,
    NzFormModule,
    NzGridModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [provideComponentStore(QaConfigStore)],
  template: `
    <nz-space [nzSplit]="spaceSplit" *ngIf="configForm.valid">
      <ng-template #spaceSplit>
        <span nz-icon nzType="minus" nzTheme="outline" class="tw-text-white"></span>
      </ng-template>

      <!-- Factory -->
      <div
        *nzSpaceItem
        nz-dropdown
        [nzDropdownMenu]="factoryMenu"
        class="tw-text-white tw-cursor-pointer tw-font-semibold"
        [class.tw-pointer-events-none]="!isAdmin()">
        {{ 'QA.FACTORY' | translate }}: {{ configForm.controls.chosenFactory.value!.name }}
      </div>
      <nz-dropdown-menu #factoryMenu="nzDropdownMenu">
        <ul nz-menu>
          <li
            nz-menu-item
            *ngFor="let factory of $vm().userFactoriesData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickFactory(factory)"
            [ngClass]="configForm.controls.chosenFactory.value?.id === factory.id ? 'tw-bg-primary tw-text-white' : ''">
            <span class="tw-inline-block tw-text-sm tw-w-full">{{ factory.name }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
      <!-- Station -->
      <div
        *nzSpaceItem
        nz-dropdown
        [nzDropdownMenu]="stationMenu"
        class="tw-text-white tw-cursor-pointer tw-font-semibold"
        [class.tw-pointer-events-none]="!isAdmin()">
        {{ 'QA.STATION' | translate }}: {{ configForm.controls.chosenStation.value!.stationName }}
      </div>
      <nz-dropdown-menu #stationMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let station of $vm().stationsData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickStation(station)"
            [ngClass]="configForm.controls.chosenStation.value?.id === station.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ station.stationName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
      <!-- Label Printer -->
      <div
        *nzSpaceItem
        nz-dropdown
        [nzDropdownMenu]="labelPrinterMenu"
        class="tw-text-white tw-cursor-pointer tw-font-semibold"
        [class.tw-pointer-events-none]="!isAdmin()">
        {{ 'QA.LABEL_PRINTER' | translate }}: {{ configForm.controls.chosenLabelPrinter.value!.printerName }}
      </div>
      <nz-dropdown-menu #labelPrinterMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let labelPrinter of configForm.controls.chosenStation.value?.stationType === StationType.QaSticker ? 
              $vm().labelPrinter2x4sData : $vm().labelPrintersData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickLabelPrinter(labelPrinter)"
            [ngClass]="configForm.controls.chosenLabelPrinter.value?.id === labelPrinter.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ labelPrinter.printerName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
      <!-- Ticket Label Printer (only for Sock stations) -->
      <ng-container *ngIf="configForm.controls.chosenStation.value?.stationType === StationType.QaSock">
        <div
          *nzSpaceItem
          nz-dropdown
          [nzDropdownMenu]="ticketLabelPrinterMenu"
          class="tw-text-white tw-cursor-pointer tw-font-semibold"
          [class.tw-pointer-events-none]="!isAdmin()">
          {{ 'QA.TICKET_LABEL_PRINTER' | translate }}: {{ configForm.controls.chosenTicketLabelPrinter.value?.printerName }}
        </div>
      </ng-container>
      <nz-dropdown-menu #ticketLabelPrinterMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let ticketLabelPrinter of $vm().ticketLabelPrintersData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickTicketLabelPrinter(ticketLabelPrinter)"
            [ngClass]="configForm.controls.chosenTicketLabelPrinter.value?.id === ticketLabelPrinter.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ ticketLabelPrinter.printerName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
      <!-- Laser Printer -->
      <div
        *nzSpaceItem
        nz-dropdown
        [nzDropdownMenu]="laserPrinterMenu"
        class="tw-text-white tw-cursor-pointer tw-font-semibold"
        [class.tw-pointer-events-none]="!isAdmin()">
        {{ 'QA.LASER_PRINTER' | translate }}: {{ configForm.controls.chosenLaserPrinter.value!.printerName }}
      </div>
      <nz-dropdown-menu #laserPrinterMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let laserPrinter of $vm().laserPrintersData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickLaserPrinter(laserPrinter)"
            [ngClass]="configForm.controls.chosenLaserPrinter.value?.id === laserPrinter.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ laserPrinter.printerName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
    </nz-space>

    <nz-modal
      [nzVisible]="qaConfigStore.$isFactoryModalVisible()"
      [nzTitle]="'QA.FACTORY' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('factory-modal')"
      [nzOkDisabled]="configForm.controls.chosenFactory.invalid">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'QA.FACTORY' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select [formControl]="configForm.controls.chosenFactory">
              <nz-option *ngFor="let factory of $vm().userFactoriesData" [nzValue]="factory" [nzLabel]="factory.name"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <nz-modal
      [nzVisible]="qaConfigStore.$isStationModalVisible()"
      [nzTitle]="'QA.STATION' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('station-modal')"
      [nzOkDisabled]="configForm.controls.chosenStation.invalid">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'QA.STATION' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select [formControl]="configForm.controls.chosenStation" nzShowSearch>
              <nz-option *ngFor="let station of $vm().stationsData" [nzValue]="station" [nzLabel]="station.stationName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <nz-modal
      [nzVisible]="qaConfigStore.$isLabelPrinterModalVisible()"
      [nzTitle]="'QA.LABEL_PRINTER' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('label-printer-modal')"
      [nzOkDisabled]="configForm.controls.chosenLabelPrinter.invalid">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="6" nzRequired class="tw-font-semibold">{{ 'QA.LABEL_PRINTER' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="18">
            <nz-select [formControl]="configForm.controls.chosenLabelPrinter" nzShowSearch>
              <nz-option 
                *ngFor="let printer of configForm.controls.chosenStation.value?.stationType === StationType.QaSticker ? 
                  $vm().labelPrinter2x4sData : $vm().labelPrintersData" 
                [nzValue]="printer" 
                [nzLabel]="printer.printerName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <nz-modal
      [nzVisible]="qaConfigStore.$isTicketLabelPrinterModalVisible()"
      [nzTitle]="'QA.TICKET_LABEL_PRINTER' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('ticket-label-printer-modal')"
      [nzOkDisabled]="configForm.controls.chosenTicketLabelPrinter.invalid">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="8" nzRequired class="tw-font-semibold">{{ 'QA.TICKET_LABEL_PRINTER' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="16">
            <nz-select [formControl]="configForm.controls.chosenTicketLabelPrinter" nzShowSearch>
              <nz-option
                *ngFor="let printer of $vm().ticketLabelPrintersData"
                [nzValue]="printer"
                [nzLabel]="printer.printerName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <nz-modal
      [nzVisible]="qaConfigStore.$isLaserPrinterModalVisible()"
      [nzTitle]="'QA.LASER_PRINTER' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('laser-printer-modal')"
      [nzOkDisabled]="configForm.controls.chosenLaserPrinter.invalid">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="6" nzRequired class="tw-font-semibold">{{ 'QA.LASER_PRINTER' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="18">
            <nz-select [formControl]="configForm.controls.chosenLaserPrinter" nzShowSearch>
              <nz-option
                *ngFor="let laserPrinter of $vm().laserPrintersData"
                [nzValue]="laserPrinter"
                [nzLabel]="laserPrinter.printerName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaConfigComponent implements AfterViewInit {
  qaConfigStore = inject(QaConfigStore);
  $vm = this.qaConfigStore.$vm;
  configForm = this.qaConfigStore.configForm;
  isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _lsStore: LocalStorageStore,
    @Optional() private readonly _qaStore: QaStore,
    @Optional() private readonly _qaStickerStore: QaStickerStore
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.qaConfigStore.getConfig(), 0);
  }

  onClickFactory(factory: UserFactoriesGetApi.ResponseItem) {
    if (this.configForm.controls.chosenFactory.value?.id === factory.id) return;

    this.configForm.controls.chosenFactory.patchValue(factory);
    this.qaConfigStore.getDataOnChooseFactory(factory.id);
    this.configForm.controls.chosenStation.reset();
    this.configForm.controls.chosenLabelPrinter.reset();
    this.configForm.controls.chosenTicketLabelPrinter.reset();
    this.configForm.controls.chosenLaserPrinter.reset();
    this.qaConfigStore.$isStationModalVisible.set(true);
  }
  onClickStation(station: QaStationsGetApi.ResponseItem) {
    if (station.id !== this.configForm.controls.chosenStation.value?.id) {
      this._qaStore?.patchState({ scanItemResp: null, controlError: null, apiStepMsg: null });
      this._qaStickerStore?.patchState({ sheet: null, controlError: null, apiStepMsg: null });
    }
    this.configForm.controls.chosenStation.patchValue(station);
    this.configForm.controls.chosenLabelPrinter.reset();
    this.configForm.controls.chosenTicketLabelPrinter.reset();
    this.qaConfigStore.$isLabelPrinterModalVisible.set(true);
  }
  onClickLabelPrinter(labelPrinter: QaPrintersGetApi.ResponseItem) {
    this.configForm.controls.chosenLabelPrinter.patchValue(labelPrinter);
    this._lsStore.setQaConfig(this.configForm.getRawValue());
  }
  onClickTicketLabelPrinter(ticketLabelPrinter: QaPrintersGetApi.ResponseItem) {
    this.configForm.controls.chosenTicketLabelPrinter.patchValue(ticketLabelPrinter);
    this._lsStore.setQaConfig(this.configForm.getRawValue());
  }
  onClickLaserPrinter(laserPrinter: QaPrintersGetApi.ResponseItem) {
    this.configForm.controls.chosenLaserPrinter.patchValue(laserPrinter);
    this._lsStore.setQaConfig(this.configForm.getRawValue());
  }

  onConfigModalCancel() {
    this._lsStore.removeQaConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal' | 'label-printer-modal' | 'ticket-label-printer-modal' | 'laser-printer-modal') {
    switch (step) {
      case 'factory-modal':
        this.qaConfigStore.getDataOnChooseFactory(this.qaConfigStore.configForm.controls.chosenFactory.value!.id);
        this.qaConfigStore.$isFactoryModalVisible.set(false);
        this.qaConfigStore.$isStationModalVisible.set(true);
        break;
      case 'station-modal':
        this.qaConfigStore.$isStationModalVisible.set(false);
        this.qaConfigStore.$isLabelPrinterModalVisible.set(true);
        break;
      case 'label-printer-modal':
        this.qaConfigStore.$isLabelPrinterModalVisible.set(false);
        if (this.configForm.controls.chosenStation.value?.stationType === StationType.QaSock) {
          this.qaConfigStore.$isTicketLabelPrinterModalVisible.set(true);
        } else {
          this.qaConfigStore.$isLaserPrinterModalVisible.set(true);
        }
        break;
      case 'ticket-label-printer-modal':
        this.qaConfigStore.$isTicketLabelPrinterModalVisible.set(false);
        this.qaConfigStore.$isLaserPrinterModalVisible.set(true);
        break;
      case 'laser-printer-modal':
        this.qaConfigStore.$isLaserPrinterModalVisible.set(false);
        this._lsStore.setQaConfig(this.configForm.getRawValue());
        this._qaStore?.patchState({ scanItemResp: null, controlError: null, apiStepMsg: null });
        this._qaStickerStore?.patchState({ sheet: null, controlError: null, apiStepMsg: null });
        break;
    }
  }

  protected readonly StationType = StationType;
}
