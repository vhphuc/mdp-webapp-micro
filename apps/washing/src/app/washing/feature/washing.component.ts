import { AsyncPipe, NgClass, NgFor, NgForOf, NgIf, NgOptimizedImage, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideComponentStore } from '@ngrx/component-store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { AvailableLanguage, TranslateStore } from '@shared/data-access/store/translate.store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, tap } from 'rxjs';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';
import { Role } from '@shared/data-access/model/api/enum/role';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { UserWidgetComponent } from '@shared/ui/component/app-user-widget.component';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { WashingScanItem } from '../data-access/model/washing.model';
import { WashingLocalStorageStore } from '../data-access/store/washing-local-storage.store';
import { WashingStore } from '../data-access/store/washing.store';
import { WashingFactoryComponent } from './washing-factory.component';
import { WashingStationComponent } from './washing-station.component';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-washing',
  standalone: true,
  template: `
    <div class="tw-flex tw-flex-col tw-h-full tw-bg-gray-200">
      <!-- header -->
      <div class="tw-h-20 tw-w-full">
        <div class="tw-flex tw-justify-between tw-items-center tw-h-12 tw-relative tw-bg-primary tw-shadow-xl">
          <div class="tw-flex">
            <div class="tw-flex tw-items-center tw-px-4">
              <img ngSrc="/assets/icons/logo-white.png" alt="logo" height="35" width="54" />
              <span class="tw-text-white tw-text-lg tw-leading-5 tw-inline-block tw-ml-2">Monster Platform</span>
            </div>
            <div class="tw-inline-block">
              <div nz-dropdown [nzDropdownMenu]="langMenu" class="tw-cursor-pointer">
                <img
                  ngSrc="../../../../assets/i18n/flags/usa.png"
                  alt="American Flag"
                  *ngIf="$currLang() === AvailableLanguage.ENGLISH"
                  height="48"
                  width="48" />
                <img
                  ngSrc="../../../../assets/i18n/flags/spain.png"
                  alt="Spain Flag"
                  *ngIf="$currLang() === AvailableLanguage.SPANISH"
                  height="48"
                  width="48" />
              </div>
              <nz-dropdown-menu #langMenu="nzDropdownMenu">
                <ul nz-menu>
                  <li nz-menu-item (click)="switchLanguage(AvailableLanguage.ENGLISH)">
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <img ngSrc="../../../../assets/i18n/flags/usa.png" alt="American Flag" height="48" width="48" />
                    </div>
                  </li>
                  <li nz-menu-item (click)="switchLanguage(AvailableLanguage.SPANISH)">
                    <div class="tw-flex tw-items-center tw-gap-3">
                      <img ngSrc="../../../../assets/i18n/flags/spain.png" alt="American Flag" height="48" width="48" />
                    </div>
                  </li>
                </ul>
              </nz-dropdown-menu>
            </div>
          </div>

          <div class="tw-absolute tw-left-1/2 tw-translate-x-[-50%]">
            <span class="tw-font-bold tw-text-2xl tw-leading-6 tw-text-white tw-uppercase">{{
              'WASHING.UI.WASH_STATION' | translate
            }}</span>
          </div>

          <app-user-widget />
        </div>
        <div class="tw-flex tw-justify-between tw-items-center tw-bg-primary tw-h-8 tw-px-4">
          <nz-breadcrumb class="tw-mb-1 tw-text-white">
            <nz-breadcrumb-item class="tw-uppercase" (click)="wStore.scanGoBack()"
              ><span class="tw-underline tw-cursor-pointer tw-text-white tw-font-semibold">{{
                'WASHING.BREAD_CRUMB.WASH_STATION' | translate
              }}</span></nz-breadcrumb-item
            >
            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) === false || (isNextScan$ | async)"
              >{{ 'WASHING.BREAD_CRUMB.SCAN_ITEM' | translate }}</nz-breadcrumb-item
            >

            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) && (isNextScan$ | async) === false"
              >{{ wStore.scanItemForm.controls.barcode.value }}</nz-breadcrumb-item
            >
            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) && (isScanFixCode$ | async) === false && (isNextScan$ | async) === false"
              >{{ 'WASHING.BREAD_CRUMB.SCAN_WASH_REASON' | translate }}</nz-breadcrumb-item
            >
            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) && (isScanFixCode$ | async) && (isNextScan$ | async) === false"
              >{{ 'WASHING.BREAD_CRUMB.SCAN_FIX_CODE' | translate }}</nz-breadcrumb-item
            >
          </nz-breadcrumb>

          <div
            class="tw-flex tw-items-center tw-justify-end"
            *ngIf="!!wStore.factoryForm.controls.factoryId.value && !!wStore.stationForm.controls.stationId.value">
            <div>
              <div
                nz-dropdown
                [nzDropdownMenu]="factoryMenu"
                [nzPlacement]="'bottomRight'"
                class="tw-px-1 tw-rounded-sm tw-cursor-pointer tw-transition tw-font-semibold tw-text-white tw-inline-block tw-text-sm"
                [class.tw-pointer-events-none]="!isAdmin()">
                {{ 'WASHING.UI.FACTORY' | translate }}: {{ factoryName$ | async }}
              </div>
              <nz-dropdown-menu #factoryMenu="nzDropdownMenu">
                <ul nz-menu>
                  <li
                    nz-menu-item
                    *ngFor="let factory of factoryData$ | async"
                    class="tw-mb-[1px] hover:tw-bg-primary-light hover:tw-text-white tw-cursor-pointer tw-min-w-[150px] tw-w-full tw-p-2"
                    (click)="onChangeFactory(factory.id)"
                    [ngClass]="factorySelected(factory.id) ? 'tw-bg-primary-light tw-text-white' : ''">
                    <span class="tw-inline-block tw-text-sm tw-w-full">{{ factory.name }}</span>
                  </li>
                </ul>
              </nz-dropdown-menu>
            </div>
            <span nz-icon nzType="minus" nzTheme="outline" class="tw-text-white"></span>
            <div>
              <div
                nz-dropdown
                [nzDropdownMenu]="stationMenu"
                [nzPlacement]="'bottomRight'"
                class="tw-px-1 tw-rounded-sm tw-cursor-pointer tw-transition tw-font-semibold tw-text-white tw-inline-block tw-text-sm"
                [class.tw-pointer-events-none]="!isAdmin()">
                {{ 'WASHING.UI.STATION' | translate }}: {{ stationName$ | async }}
              </div>
              <nz-dropdown-menu #stationMenu="nzDropdownMenu">
                <ul nz-menu>
                  <li
                    nz-menu-item
                    *ngFor="let station of stationData$ | async"
                    class="tw-mb-[1px] hover:tw-bg-primary-light hover:tw-text-white tw-cursor-pointer tw-min-w-[150px] tw-w-full tw-p-2"
                    (click)="onChangeStation(station.id)"
                    [ngClass]="stationSelected(station.id) ? 'tw-bg-primary-light tw-text-white' : ''">
                    <span class="tw-inline-block tw-text-sm tw-w-full">{{ station.stationName }}</span>
                  </li>
                </ul>
              </nz-dropdown-menu>
            </div>
          </div>
        </div>
      </div>

      <!-- content -->
      <div class="tw-m-2 tw-p-2 tw-bg-white tw-flex-1 tw-overflow-y-auto tw-flex tw-flex-col">
        <div class="tw-flex tw-justify-end tw-items-center tw-gap-6" *ngIf="(isScan$ | async) === false || (isNextScan$ | async)">
          <form nz-form [formGroup]="wStore.scanItemForm" class="tw-flex tw-justify-center tw-pb-1 tw-w-1/3">
            <nz-form-item nz-row nzGutter="30" class="tw-mb-0 tw-w-[500px]">
              <nz-form-label nzNoColon class="tw-flex tw-items-center tw-justify-end tw-h-[59px] tw-pb-[22px] tw-capitalize">
                <span class="tw-font-semibold tw-text-xl">{{ 'WASHING.UI.SCAN_ITEM' | translate }}</span>
              </nz-form-label>
              <nz-form-control [nzSm]="24" [nzErrorTip]="barcodeScanErrorTpl">
                <input
                  type="text"
                  nz-input
                  [formControl]="wStore.scanItemForm.controls.barcode"
                  nzSize="large"
                  placeholder="{{ 'WASHING.UI.ITEM' | translate }}"
                  appKeepFocus
                  (keyup.enter)="onScanBarcode()" />
                <ng-template #barcodeScanErrorTpl let-control>
                  <ng-container *ngIf="control.hasError('required')">{{ 'WASHING.UI.FIELD_REQUIRED' | translate }}</ng-container>
                  <ng-container *ngIf="control.hasError('maxlength')">{{ 'BARCODE_MAXLENGTH' | translate }}</ng-container>
                </ng-template>
              </nz-form-control>
            </nz-form-item>
          </form>
          <div class="tw-pb-3 tw-w-1/3">
            <span *ngIf="!!(errScan$ | async)" class="tw-text-2xl tw-text-[#ff4d4f] tw-font-bold tw-break-words">{{
              (errScan$ | async)! | translate
            }}</span>
            <span
              *ngIf="!!(acceptMsg$ | async) && (isNextScan$ | async)"
              class="tw-text-2xl tw-font-bold {{ wStore.isSuccess ? 'tw-text-green-500' : 'tw-text-[#ff4d4f]' }}"
              >{{ (acceptMsg$ | async)! | translate }}</span
            >
          </div>
        </div>

        <nz-content class="tw-h-full tw-flex tw-flex-col" *ngIf="isScan$ | async">
          <nz-content *ngIf="(isNextScan$ | async) === false" class="tw-flex tw-justify-end tw-items-center tw-gap-6 tw-py-2">
            <div class=" tw-w-1/3">
              <form nz-form [formGroup]="wStore.washingBodyForm" class="tw-flex tw-justify-center tw-pb-2">
                <nz-form-item nz-row nzGutter="30" class="tw-mb-0 tw-w-[600px]">
                  <nz-form-label nzNoColon class="tw-font-semibold tw-text-3xl tw-flex tw-items-center tw-capitalize tw-w-[190px]">
                    <span class="tw-font-semibold tw-text-xl">{{ 'WASHING.UI.QUANTITY' | translate }}</span>
                  </nz-form-label>
                  <nz-form-control [nzSm]="24">
                    <input
                      type="text"
                      nz-input
                      nzSize="large"
                      [formControl]="wStore.washingBodyForm.controls.quantity"
                      class="tw-font-bold" />
                  </nz-form-control>
                </nz-form-item>
              </form>

              <form nz-form [formGroup]="wStore.washingForm" class="tw-flex tw-justify-center">
                <nz-form-item nz-row nzGutter="30" class="tw-mb-0 tw-w-[600px]">
                  <nz-form-label nzNoColon class="tw-flex tw-items-center tw-h-[59px] tw-pb-[20px] tw-capitalize tw-w-[190px]">
                    <span class="tw-font-semibold tw-text-xl" *ngIf="(isScanFixCode$ | async) === false">{{
                      'WASHING.UI.SCAN_WASH_REASON' | translate
                    }}</span>
                    <span class="tw-font-semibold tw-text-xl" *ngIf="isScanFixCode$ | async">{{
                      'WASHING.UI.SCAN_FIX_CODE' | translate
                    }}</span>
                  </nz-form-label>

                  <nz-form-control [nzSm]="24" [nzErrorTip]="locationErrorTpl">
                    <input
                      type="text"
                      nz-input
                      nzSize="large"
                      [formControl]="wStore.washingForm.controls.barcodeAction"
                      placeholder="{{
                        ((isScanFixCode$ | async) === false ? 'WASHING.UI.PLACEHOLDER_WASH_REASON' : 'WASHING.UI.PLACEHOLDER_FIX_CODE')
                          | translate
                      }}"
                      (keyup.enter)="wStore.onWashStation()"
                      appKeepFocus
                      focusOnInitOnly />
                    <ng-template #locationErrorTpl let-control>
                      <ng-container *ngIf="control.hasError('required')">{{ 'WASHING.UI.FIELD_REQUIRED' | translate }}</ng-container>
                      <ng-container *ngIf="control.hasError('maxlength')">{{ 'BARCODE_MAXLENGTH' | translate }}</ng-container>
                    </ng-template>
                  </nz-form-control>
                </nz-form-item>
              </form>
            </div>

            <div class="tw-pb-3 tw-w-1/3">
              <span *ngIf="!!(acceptMsg$ | async) && (isNextScan$ | async) === false" class="tw-text-2xl tw-font-bold tw-text-[#ff4d4f]">{{
                (acceptMsg$ | async)! | translate
              }}</span>
            </div>
          </nz-content>

          <nz-content class="tw-h-full">
            <nz-content class="tw-p-2 tw-flex tw-gap-x-8 tw-h-full">
              <nz-content class="tw-w-[500px] tw-max-w-[500px] tw-inline-flex tw-flex-col">
                <div class="tw-text-xl tw-mb-3">
                  <nz-content>
                    @if ((washingScanItem$ | async)!.preQrCode) {
                      <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.PREQRCODE' | translate }} : </span>
                      <span> {{ (washingScanItem$ | async)!.preQrCode }}</span>
                    } @else {
                      <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.BARCODE' | translate }} : </span>
                      <span> {{ (washingScanItem$ | async)!.barcode }}</span>
                    }
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.SKU' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.sku }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.QUANTITY' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.quantity }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.PARTNER_ID' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.partnerId }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.ORDER' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.orderId }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.PARTNER_ORDER' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.partnerOrderId }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.STYLE' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.style }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.COLOR' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.color }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-bold tw-text-red-500 tw-text-3xl tw-inline-block">{{ 'WASHING.UI.SIZE' | translate }} : </span>
                    <span class="tw-font-bold tw-text-red-500 tw-text-3xl"> {{ (washingScanItem$ | async)!.size }}</span>
                  </nz-content>
                  <nz-content class="tw-pb-3">
                    <span class="tw-font-semibold tw-inline-block ">{{ 'WASHING.UI.TYPE' | translate }} : </span>
                    <span> {{ (washingScanItem$ | async)!.type }}</span>
                  </nz-content>
                </div>
                <nz-content
                  class="tw-border-black tw-border-solid tw-border tw-relative tw-py-4"
                  *ngIf="(washingScanItem$ | async)!.neckLabelImage">
                  <label
                    class="tw-absolute -tw-top-3 tw-bg-white tw-border tw-border-solid tw-text-sm tw-px-2 tw-font-semibold tw-left-5 tw-capitalize"
                    >{{ 'NECK_LABEL.NECK_LABEL' | translate }}</label
                  >
                  <img
                    class="tw-relative tw-object-contain"
                    ngSrc="{{ (washingScanItem$ | async)!.neckLabelImage }}"
                    [fill]="true"
                    appImageErrorUrl />
                </nz-content>
              </nz-content>
              <nz-content class="tw-flex-1 tw-h-full tw-flex tw-flex-col">
                <div class="tw-flex tw-gap-x-3 tw-text-xl tw-items-center tw-mb-6">
                  <nz-content class="tw-w-2/5">
                    <span class="tw-font-semibold tw-inline-block">{{ 'WASHING.UI.ITEM_STATUS' | translate }} : </span>
                    <span class="tw-uppercase"> {{ (washingScanItem$ | async)!.statusName }}</span>
                  </nz-content>
                </div>

                <nz-content class="tw-border-black tw-border-solid tw-border tw-relative">
                  <nz-tabset nzType="card" class="tw-h-full" nzSize="large" [nzTabBarGutter]="5" [nzSelectedIndex]="wStore.activeTabIndex">
                    <nz-tab *ngFor="let tab of (washingScanItem$ | async)!.washItems" [nzTitle]="titleTemplate">
                      <ng-template #titleTemplate>
                        <div
                          class="tw-px-3 tw-h-6 tw-border tw-border-solid tw-font-semibold tw-text-sm"
                          [ngClass]="
                            tab.status === ItemTransitionStatus.PrintPending
                              ? 'tw-bg-yellow-300 tw-border-transparent'
                              : tab.status === ItemTransitionStatus.QaFailure
                                ? 'tw-bg-[red] tw-text-white tw-border-transparent'
                                : tab.status === ItemTransitionStatus.QaSuccess
                                  ? 'tw-bg-[green] tw-text-white tw-border-transparent'
                                  : 'tw-bg-white'
                          ">
                          {{ tab.description }}
                        </div>
                      </ng-template>

                      <div class="tw-h-[calc(100%-12px)] tw-image-fill tw-bg-white tw-mt-[12px]">
                        <img class="tw-object-contain" [src]="tab.previewUrl" />
                      </div>
                    </nz-tab>
                  </nz-tabset>
                </nz-content>
              </nz-content>
            </nz-content>
          </nz-content>
        </nz-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn div {
        border-color: yellow !important;
        color: black !important;
        background: yellow !important;
      }
      :host ::ng-deep .ant-tabs-tab:hover {
        color: unset !important;
      }

      :host ::ng-deep .ant-breadcrumb-separator {
        color: white;
      }
      :host ::ng-deep .ant-tabs-content {
        height: 100% !important;
        .ant-tabs-tabpane {
          height: 100% !important;
        }
      }
      :host ::ng-deep .ant-tabs-content .ant-layout-content {
        height: 100% !important;
      }
      :host ::ng-deep .ant-tabs-nav .ant-tabs-tab {
        padding: 0 !important;
        background-color: transparent;
        border: none;
      }
      :host ::ng-deep .ant-tabs-nav {
        position: absolute;
        z-index: 1;
        margin-bottom: 0;
        top: -13px;
        padding-left: 20px;
        width: 100%;
      }
      :host ::ng-deep .ant-tabs-nav::before {
        border-bottom: 0 !important;
      }
      :host ::ng-deep .ant-tabs-content-holder {
        border: 1px solid #f4f4f4 !important;
        border-top: none !important;
      }
    `,
  ],
  providers: [provideComponentStore(WashingStore), WashingLocalStorageStore],
  imports: [
    // Angular
    RouterModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    NgFor,
    NgStyle,
    AsyncPipe,
    NgClass,
    // Nz
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzToolTipModule,
    NzDropDownModule,
    NzAvatarModule,
    NzInputModule,
    NzFormModule,
    NzTabsModule,
    NzBreadCrumbModule,
    NzSpinModule,
    // Others
    TranslateModule,
    UserWidgetComponent,
    KeepFocusDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WashingComponent implements OnInit {
  mdTitleFactory: string = this._translateSvc.instant('WASHING.UI.FACTORY');
  mdTitleStation: string = this._translateSvc.instant('WASHING.UI.STATION');

  translateStore = inject(TranslateStore);
  authStore = inject(AuthStore);
  wStore = inject(WashingStore);
  stStore = inject(WashingLocalStorageStore);

  washingScanItem$!: Observable<WashingScanItem.Response>;
  factoryName$!: Observable<string>;
  stationName$!: Observable<string>;
  factoryData$!: Observable<UserFactoriesGetApi.Response>;
  stationData$!: Observable<StationsGetApi.Response>;
  isScan$!: Observable<boolean>;
  isScanFixCode$!: Observable<boolean>;
  isNextScan$!: Observable<boolean>;
  errScan$!: Observable<string>;
  acceptMsg$!: Observable<string>;
  isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);
  $currLang = this.translateStore.selectSignal(s => s.currentLang);

  constructor(
    private readonly _nzModalSvc: NzModalService,
    private readonly _translateSvc: TranslateService,
    private readonly _lsStore: LocalStorageStore
  ) {}

  ngOnInit(): void {
    if (!this.stStore.getSelectedFactory() && !!this._lsStore.getToken() && !this.wStore.isHiddenFactory) {
      this.factorySelectItem(this.mdTitleFactory);
    }

    if (this.stStore.getSelectedFactory() && !this.stStore.getSelectedStation() && !!this._lsStore.getToken()) {
      this.stationSelectItem(this.mdTitleStation);
    }

    this.washingScanItem$ = this.wStore.select(s => s.washingScanItem);
    this.factoryName$ = this.wStore.select(s => s.factoryName);
    this.factoryData$ = this.wStore.select(s => s.factoriesData);
    this.stationData$ = this.wStore.select(s => s.stationsData);
    this.isScan$ = this.wStore.select(s => s.isScan);
    this.isScanFixCode$ = this.wStore.select(s => s.isScanFixCode);
    this.stationName$ = this.wStore.select(s => s.stationName);
    this.errScan$ = this.wStore.select(s => s.errScan);
    this.acceptMsg$ = this.wStore.select(s => s.acceptMsg);
    this.isNextScan$ = this.wStore.select(s => s.isNextScan);
  }

  onScanBarcode() {
    if (this.wStore.scanItemForm.controls.barcode.value.trim().length === 0 || this.wStore.scanItemForm.controls.barcode.invalid) return;
    this.wStore.scanItem();
  }

  factorySelected(id: number) {
    return this.stStore.getSelectedFactory() === id;
  }

  stationSelected(id: number) {
    return this.stStore.getSelectedStation() === id;
  }

  factorySelectItem(modalTitle: string) {
    const modalRef = this._nzModalSvc.create({
      nzTitle: modalTitle,
      nzContent: WashingFactoryComponent,
      nzCancelDisabled: true,
      nzAutofocus: null,
      nzClosable: true,
      nzOnCancel: () => {
        modalRef.destroy();
        this.stStore.removeSelectedFactory();
        this.authStore.signOut();
      },
    });
    modalRef.componentInstance!.wStore = this.wStore;
    modalRef.componentInstance!.authStore = this.authStore;
    modalRef.componentInstance!.stStore = this.stStore;

    modalRef
      .componentInstance!.clickSubmit.pipe(
        tap(() => {
          modalRef.destroy();
          this.stationSelectItem(this.mdTitleStation);
          this.wStore.getStationList();
        })
      )
      .subscribe();
  }

  onChangeStation(value: number) {
    if (this.stStore.getSelectedStation() === value) return;
    this.wStore.stationForm.controls.stationId.setValue(value);
    this.stStore.setSelectedStation(value);
    this.wStore.stationSetName();
  }

  onChangeFactory(value: number) {
    if (this.stStore.getSelectedFactory() === value) return;
    this.wStore.factoryForm.controls.factoryId.setValue(value);
    this.wStore.stationForm.controls.stationId.reset();
    this.stationSelectItem(this.mdTitleStation);
    this.wStore.scanGoBack();
    this.wStore.getStationList();
  }

  stationSelectItem(modalTitle: string) {
    const modalRef = this._nzModalSvc.create({
      nzTitle: modalTitle,
      nzContent: WashingStationComponent,
      nzCancelDisabled: true,
      nzClosable: true,
      nzAutofocus: null,
      nzOnCancel: () => {
        modalRef.destroy();
        this.stStore.removeSelectedFactory();
        this.stStore.removeSelectedStation();
        this.authStore.signOut();
      },
    });
    modalRef.componentInstance!.wStore = this.wStore;
    modalRef.componentInstance!.authStore = this.authStore;
    modalRef.componentInstance!.stStore = this.stStore;

    modalRef
      .componentInstance!.clickSubmit.pipe(
        tap(() => {
          modalRef.destroy();
        })
      )
      .subscribe();
  }

  switchLanguage(langCode: AvailableLanguage) {
    this.translateStore.useLang(langCode);
  }

  logOut() {
    this.authStore.signOut();
  }

  protected readonly AvailableLanguage = AvailableLanguage;
  protected readonly ItemTransitionStatus = ItemTransitionStatus;
}
