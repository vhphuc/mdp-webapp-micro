import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NzRowDirective } from 'ng-zorro-antd/grid';
import { NzDropDownDirective, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzMenuItemComponent, NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { TranslateModule } from '@ngx-translate/core';
import { Role } from '@shared/data-access/model/api/enum/role';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { HangtagStore } from '../hangtag.store';
import { PrinterConfigurationApiService } from '@shared/data-access/api/printer-configuration-api.service';
import { PrintersGetApi } from '@shared/data-access/model/api/printer-configuration-api';
import { PrinterType } from '@shared/data-access/model/api/enum/printer-type';
import { PageSizeType } from '@shared/data-access/model/api/enum/page-size';
import { FormsModule } from '@angular/forms';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-hangtag-config',
  standalone: true,
  imports: [
    NzDropDownDirective,
    NzDropDownModule,
    NzFormModule,
    NzIconDirective,
    NzMenuModule,
    NzMenuItemComponent,
    NzModalComponent,
    NzRowDirective,
    NzSelectModule,
    NzSpaceModule,
    TranslateModule,
    NgClass,
    NzModalModule,
    FormsModule,
  ],
  template: `
    <!-- if already done config and config has been transferred to form -->
    @if (!isConfiguring()) {
      <nz-space [nzSplit]="spaceSplit">
        <ng-template #spaceSplit>
          <span nz-icon nzType="minus" nzTheme="outline" class="tw:text-white"></span>
        </ng-template>

        <!-- Factory -->
        <div
          *nzSpaceItem
          nz-dropdown
          [nzDropdownMenu]="factoryMenu"
          class="tw:text-white tw:cursor-pointer tw:font-semibold"
          [class.tw:pointer-events-none]="!isAdmin()">
          {{ 'FACTORY' | translate }}: {{ config().factory!.name }}
        </div>
        <nz-dropdown-menu #factoryMenu="nzDropdownMenu">
          <ul nz-menu>
            @for (factory of userFactoriesData(); track factory.id) {
              <li
                nz-menu-item
                class="tw:hover:bg-primary-light tw:hover:text-white tw:cursor-pointer"
                (click)="onClickFactory(factory)"
                [ngClass]="config().factory!.id === factory.id ? 'tw:bg-primary tw:text-white' : ''">
                <span class="tw:inline-block tw:text-sm tw:w-full">{{ factory.name }}</span>
              </li>
            }
          </ul>
        </nz-dropdown-menu>

        <!-- Hangtag Printer -->
        <div
          *nzSpaceItem
          nz-dropdown
          [nzDropdownMenu]="hangtagPrinterMenu"
          class="tw:text-white tw:cursor-pointer tw:font-semibold"
          [class.tw:pointer-events-none]="!isAdmin()">
          {{ 'SHIPPING.HANGTAG_PRINTER' | translate }}: {{ config().hangtagPrinter!.printerName }}
        </div>
        <nz-dropdown-menu #hangtagPrinterMenu="nzDropdownMenu">
          <ul nz-menu class="tw:max-h-96 tw:overflow-y-auto tw:slim-scrollbar">
            @for (hangtagPrinter of hangtagPrintersData(); track hangtagPrinter.id) {
              <li
                nz-menu-item
                class="tw:hover:bg-primary-light tw:hover:text-white tw:cursor-pointer"
                (click)="onClickHangtagPrinter(hangtagPrinter)"
                [ngClass]="config().hangtagPrinter!.id === hangtagPrinter.id ? 'tw:bg-primary tw:text-white' : ''">
                <span>{{ hangtagPrinter.printerName }}</span>
              </li>
            }
          </ul>
        </nz-dropdown-menu>
      </nz-space>
    }

    <!-- Factory -->
    <nz-modal
      [nzVisible]="isFactoryModalVisible()"
      [nzTitle]="'FACTORY' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('factory-modal')"
      [nzOkDisabled]="!config().factory">
      <ng-container *nzModalContent>
        <nz-form-item class="tw:mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw:font-semibold">{{ 'FACTORY' | translate }} </nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select id="factory-select" [ngModel]="config().factory" (ngModelChange)="signalConfigFactoryChange($event)">
              @for (factory of userFactoriesData(); track factory.id) {
                <nz-option [nzValue]="factory" [nzLabel]="factory.name"></nz-option>
              }
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <!-- Hangtag Printer -->
    <nz-modal
      [nzVisible]="isHangtagPrinterModalVisible()"
      [nzTitle]="'SHIPPING.HANGTAG_PRINTER' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('hangtag-printer-modal')">
      <ng-container *nzModalContent>
        <nz-form-item class="tw:mb-0">
          <nz-form-label [nzSm]="7" class="tw:font-semibold">{{ 'SHIPPING.HANGTAG_PRINTER' | translate }} </nz-form-label>
          <nz-form-control [nzSm]="17">
            <nz-select
              id="hangtag-printer-select"
              [ngModel]="config().hangtagPrinter"
              (ngModelChange)="signalConfigHangtagPrinterChange($event)"
              nzShowSearch>
              @for (hangtagPrinter of hangtagPrintersData(); track hangtagPrinter.id) {
                <nz-option [nzValue]="hangtagPrinter" [nzLabel]="hangtagPrinter.printerName"></nz-option>
              }
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HangtagConfigComponent implements OnInit, AfterViewInit {
  store = inject(HangtagStore);
  isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _lsStore: LocalStorageStore,
    private readonly _printerConfigApiSvc: PrinterConfigurationApiService
  ) {}

  ngOnInit() {
    this.getDataIfAlreadySetupConfig();
  }

  ngAfterViewInit() {
    setTimeout(() => this.getConfig(), 0);
  }

  onClickFactory(factory: UserFactoriesGetApi.ResponseItem) {
    if (this.config().factory?.id === factory.id) return;

    this.config.set({
      factory: factory,
      hangtagPrinter: null,
    });
    this.getDataByFactory(factory.id);
    this.isHangtagPrinterModalVisible.set(true);
  }
  onClickHangtagPrinter(hangtagPrinter: PrintersGetApi.ResponseItem | null) {
    this.config.update(config => {
      config.hangtagPrinter = hangtagPrinter;
      return { ...config };
    });
    this._lsStore.setHangtagConfig(this.config());
  }

  onConfigModalCancel() {
    this._lsStore.removeHangtagConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal' | 'hangtag-printer-modal') {
    switch (step) {
      case 'factory-modal':
        this.getDataByFactory(this.config().factory!.id);
        this.isFactoryModalVisible.set(false);
        this.isHangtagPrinterModalVisible.set(true);
        break;
      case 'hangtag-printer-modal':
        this.isHangtagPrinterModalVisible.set(false);
        this._lsStore.setHangtagConfig(this.config());
        this.store.barcode.set(null);
        break;
    }
  }

  signalConfigFactoryChange(factory: UserFactoriesGetApi.ResponseItem) {
    this.config.update(config => {
      config.factory = factory;
      return { ...config };
    });
  }
  signalConfigHangtagPrinterChange(printer: PrintersGetApi.ResponseItem) {
    this.config.update(config => {
      config.hangtagPrinter = printer;
      return { ...config };
    });
  }

  isFactoryModalVisible = signal(false);
  isHangtagPrinterModalVisible = signal(false);

  isConfiguring = computed(() => {
    let isConfiguring = false;
    if (this.isFactoryModalVisible()) isConfiguring = true;
    if (this.isHangtagPrinterModalVisible()) isConfiguring = true;
    if (!this.config().factory) isConfiguring = true;
    if (!this.config().hangtagPrinter) isConfiguring = true;
    return isConfiguring;
  });

  config = signal<{
    factory: UserFactoriesGetApi.ResponseItem | null;
    hangtagPrinter: PrintersGetApi.ResponseItem | null;
  }>({
    factory: null,
    hangtagPrinter: null,
  });

  userFactoriesData = this._lsStore.selectSignal(s => s.user?.factories ?? []);
  hangtagPrintersData = signal<PrintersGetApi.Response>([]);

  hangtagConfig = this._lsStore.selectSignal(s => s.hangtagConfig);

  private getDataIfAlreadySetupConfig() {
    if (!this.hangtagConfig()?.factory) return;

    const factoryId = this.hangtagConfig()!.factory.id;
    this.getDataByFactory(factoryId);
  }

  private getDataByFactory(factoryId: Factory) {
    this._printerConfigApiSvc.printersGet(factoryId, PrinterType.HangTag, PageSizeType._1X3).subscribe(resp => {
      this.hangtagPrintersData.set(resp.data ?? []);
    });
  }

  getConfig() {
    this._lsStore
      .select(s => s.user?.factories)
      .subscribe(userFactories => {
        if (!userFactories) return;

        if (this.hangtagConfig()?.factory) {
          if (userFactories.some(uf => uf.id === this.hangtagConfig()!.factory.id)) {
            this.config.set(this.hangtagConfig()!);
          } else {
            this._lsStore.removeHangtagConfig();
            this.startConfigProcess(userFactories);
          }
        } else {
          this.startConfigProcess(userFactories);
        }
      });
  }

  startConfigProcess(userFactories: UserFactoriesGetApi.Response) {
    if (userFactories.length > 1) {
      this.isFactoryModalVisible.set(true);
    } else if (userFactories.length === 1) {
      this.config.update(config => {
        config.factory = userFactories[0];
        return { ...config };
      });
      this.getDataByFactory(this.config().factory!.id);
      this.isHangtagPrinterModalVisible.set(true);
    }
  }
}
