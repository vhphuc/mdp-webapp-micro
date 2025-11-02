import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideComponentStore } from '@ngrx/component-store';
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
import { QaLeadConfigStore } from '../data-access/store/qa-lead-config.store';
import { QaLeadPrintersGetApi, QaLeadStationsGetApi } from '../data-access/model/qa-lead-config-api';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { QaLeadStore } from './qa-lead-flow/data-access/qa-lead.store';
import { Role } from '@shared/data-access/model/api/enum/role';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-qa-lead-config',
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
    NzSpinModule,
  ],
  providers: [provideComponentStore(QaLeadConfigStore)],
  template: `
    <nz-space [nzSplit]="spaceSplit" *ngIf="!$isConfiguring()">
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
        {{ 'QA.FACTORY' | translate }}: {{ $config().factory!.name }}
      </div>
      <nz-dropdown-menu #factoryMenu="nzDropdownMenu">
        <ul nz-menu>
          <li
            nz-menu-item
            *ngFor="let factory of $vm().userFactoriesData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickFactory(factory)"
            [ngClass]="$config().factory?.id === factory.id ? 'tw-bg-primary tw-text-white' : ''">
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
        {{ 'QA.STATION' | translate }}: {{ $config().station!.stationName }}
      </div>
      <nz-dropdown-menu #stationMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let station of $vm().stationsData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickStation(station)"
            [ngClass]="$config().station?.id === station.id ? 'tw-bg-primary tw-text-white' : ''">
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
        {{ 'QA.LABEL_PRINTER' | translate }}: {{ $config().labelPrinter!.printerName }}
      </div>
      <nz-dropdown-menu #labelPrinterMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let labelPrinter of $config().station?.stationType === StationType.QaSticker ? 
              $vm().labelPrinter2x4sData : $vm().labelPrintersData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickLabelPrinter(labelPrinter)"
            [ngClass]="$config().labelPrinter?.id === labelPrinter.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ labelPrinter.printerName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
      <!-- Ticket Label Printer (only for Sock stations) -->
      <ng-container *ngIf="$config().station?.stationType === StationType.QaSock">
        <div
          *nzSpaceItem
          nz-dropdown
          [nzDropdownMenu]="ticketLabelPrinterMenu"
          class="tw-text-white tw-cursor-pointer tw-font-semibold"
          [class.tw-pointer-events-none]="!isAdmin()">
          {{ 'QA.TICKET_LABEL_PRINTER' | translate }}: {{ $config().ticketLabelPrinter?.printerName }}
        </div>
      </ng-container>
      <nz-dropdown-menu #ticketLabelPrinterMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let ticketLabelPrinter of $vm().ticketLabelPrintersData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickTicketLabelPrinter(ticketLabelPrinter)"
            [ngClass]="$config().ticketLabelPrinter?.id === ticketLabelPrinter.id ? 'tw-bg-primary tw-text-white' : ''">
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
        {{ 'QA.LASER_PRINTER' | translate }}: {{ $config().laserPrinter!.printerName }}
      </div>
      <nz-dropdown-menu #laserPrinterMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let laserPrinter of $vm().laserPrintersData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickLaserPrinter(laserPrinter)"
            [ngClass]="$config().laserPrinter?.id === laserPrinter.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ laserPrinter.printerName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
    </nz-space>

    <nz-modal
      [nzVisible]="qaLeadConfigStore.$isFactoryModalVisible()"
      [nzTitle]="'QA.FACTORY' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('factory-modal')"
      [nzOkDisabled]="!$config().factory">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'QA.FACTORY' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select [ngModel]="$config().factory" (ngModelChange)="signalConfigFactoryChange($event)">
              <nz-option *ngFor="let factory of $vm().userFactoriesData" [nzValue]="factory" [nzLabel]="factory.name"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <nz-modal
      [nzVisible]="qaLeadConfigStore.$isStationModalVisible()"
      [nzTitle]="'QA.STATION' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('station-modal')"
      [nzOkDisabled]="!$config().station">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'QA.STATION' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select [ngModel]="$config().station" (ngModelChange)="signalConfigStationChange($event)" nzShowSearch>
              <nz-option *ngFor="let station of $vm().stationsData" [nzValue]="station" [nzLabel]="station.stationName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <nz-modal
      [nzVisible]="qaLeadConfigStore.$isLabelPrinterModalVisible()"
      [nzTitle]="'QA.LABEL_PRINTER' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('label-printer-modal')"
      [nzOkDisabled]="!$config().labelPrinter">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="6" nzRequired class="tw-font-semibold">{{ 'QA.LABEL_PRINTER' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="18">
            <nz-select [ngModel]="$config().labelPrinter" (ngModelChange)="signalConfigLabelPrinterChange($event)" nzShowSearch>
            <nz-option 
                *ngFor="let printer of $config().station?.stationType === StationType.QaSticker ? 
                  $vm().labelPrinter2x4sData : $vm().labelPrintersData" 
                [nzValue]="printer" 
                [nzLabel]="printer.printerName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <nz-modal
      [nzVisible]="qaLeadConfigStore.$isTicketLabelPrinterModalVisible()"
      [nzTitle]="'QA.TICKET_LABEL_PRINTER' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('ticket-label-printer-modal')"
      [nzOkDisabled]="!$config().ticketLabelPrinter">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="8" nzRequired class="tw-font-semibold">{{ 'QA.TICKET_LABEL_PRINTER' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="16">
            <nz-select [ngModel]="$config().ticketLabelPrinter" (ngModelChange)="signalConfigTicketLabelPrinterChange($event)" nzShowSearch>
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
      [nzVisible]="qaLeadConfigStore.$isLaserPrinterModalVisible()"
      [nzTitle]="'QA.LASER_PRINTER' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('laser-printer-modal')"
      [nzOkDisabled]="!$config().laserPrinter">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="6" nzRequired class="tw-font-semibold">{{ 'QA.LASER_PRINTER' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="18">
            <nz-select [ngModel]="$config().laserPrinter" (ngModelChange)="signalConfigLaserPrinterChange($event)" nzShowSearch>
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
export class QaLeadConfigComponent implements AfterViewInit {
  qaLeadStore = inject(QaLeadStore);
  qaLeadConfigStore = inject(QaLeadConfigStore);
  $vm = this.qaLeadConfigStore.$vm;
  $isConfiguring = this.qaLeadConfigStore.$isConfiguring;
  $config = this.qaLeadConfigStore.$config;
  isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _lsStore: LocalStorageStore
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.qaLeadConfigStore.getConfig(), 0);
  }

  onClickFactory(factory: UserFactoriesGetApi.ResponseItem) {
    if (this.$config().factory?.id === factory.id) return;

    this.$config.set({
      factory: factory,
      station: null,
      labelPrinter: null,
      ticketLabelPrinter: null,
      laserPrinter: null,
    });
    this.qaLeadConfigStore.getDataOnChooseFactory(factory.id);
    this.qaLeadConfigStore.$isStationModalVisible.set(true);
  }
  onClickStation(station: QaLeadStationsGetApi.ResponseItem) {
    if (station.id !== this.$config().station?.id) {
      this.qaLeadStore.patchState({ scanItemResp: null });
    }
    this.$config.update(c => {
      c.station = station;
      c.labelPrinter = null;
      c.ticketLabelPrinter = null;
      return { ...c };
    });
    this.qaLeadConfigStore.$isLabelPrinterModalVisible.set(true);
  }
  onClickLabelPrinter(labelPrinter: QaLeadPrintersGetApi.ResponseItem) {
    this.$config.update(c => {
      c.labelPrinter = labelPrinter;
      return { ...c };
    });
    this._lsStore.setQaLeadConfig(this.$config());
  }
  onClickTicketLabelPrinter(ticketLabelPrinter: QaLeadPrintersGetApi.ResponseItem) {
    this.$config.update(c => {
      c.ticketLabelPrinter = ticketLabelPrinter;
      return { ...c };
    });
    this._lsStore.setQaLeadConfig(this.$config());
  }
  onClickLaserPrinter(laserPrinter: QaLeadPrintersGetApi.ResponseItem) {
    this.$config.update(c => {
      c.laserPrinter = laserPrinter;
      return { ...c };
    });
    this._lsStore.setQaLeadConfig(this.$config());
  }

  onConfigModalCancel() {
    this._lsStore.removeQaLeadConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal' | 'label-printer-modal' | 'ticket-label-printer-modal' | 'laser-printer-modal') {
    switch (step) {
      case 'factory-modal':
        this.qaLeadConfigStore.getDataOnChooseFactory(this.$config().factory!.id);
        this.qaLeadConfigStore.$isFactoryModalVisible.set(false);
        this.qaLeadConfigStore.$isStationModalVisible.set(true);
        break;
      case 'station-modal':
        this.qaLeadConfigStore.$isStationModalVisible.set(false);
        this.qaLeadConfigStore.$isLabelPrinterModalVisible.set(true);
        break;
      case 'label-printer-modal':
        this.qaLeadConfigStore.$isLabelPrinterModalVisible.set(false);
        if (this.$config().station?.stationType === StationType.QaSock) {
          this.qaLeadConfigStore.$isTicketLabelPrinterModalVisible.set(true);
        } else {
          this.qaLeadConfigStore.$isLaserPrinterModalVisible.set(true);
        }
        break;
      case 'ticket-label-printer-modal':
        this.qaLeadConfigStore.$isTicketLabelPrinterModalVisible.set(false);
        this.qaLeadConfigStore.$isLaserPrinterModalVisible.set(true);
        break;
      case 'laser-printer-modal':
        this.qaLeadConfigStore.$isLaserPrinterModalVisible.set(false);
        this._lsStore.setQaLeadConfig(this.$config());
        this.qaLeadStore.patchState({ scanItemResp: null, controlError: null, apiStepMsg: null });
        break;
    }
  }

  signalConfigFactoryChange(factory: UserFactoriesGetApi.ResponseItem) {
    this.$config.update(config => {
      config.factory = factory;
      return { ...config };
    });
  }
  signalConfigStationChange(station: QaLeadStationsGetApi.ResponseItem) {
    this.$config.update(config => {
      config.station = station;
      return { ...config };
    });
  }
  signalConfigLabelPrinterChange(labelPrinter: QaLeadPrintersGetApi.ResponseItem) {
    this.$config.update(config => {
      config.labelPrinter = labelPrinter;
      return { ...config };
    });
  }
  signalConfigTicketLabelPrinterChange(ticketLabelPrinter: QaLeadPrintersGetApi.ResponseItem) {
    this.$config.update(config => {
      config.ticketLabelPrinter = ticketLabelPrinter;
      return { ...config };
    });
  }
  signalConfigLaserPrinterChange(laserPrinter: QaLeadPrintersGetApi.ResponseItem) {
    this.$config.update(config => {
      config.laserPrinter = laserPrinter;
      return { ...config };
    });
  }

  protected readonly StationType = StationType;
}
