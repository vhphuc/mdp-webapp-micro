import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { Observable, tap } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { AvailableLanguage, TranslateStore } from '@shared/data-access/store/translate.store';
import { PrintLeadStationComponent } from './print-lead-station.component';
import { PrintLeadFactoryComponent } from './print-lead-factory.component';
import { provideComponentStore } from '@ngrx/component-store';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { PrintLeadDetailComponent } from './print-lead-detail.component';
import { PrintLeadScanItem } from '../data-access/model/print-lead.model';
import { PrintLeadLocalStorageStore } from '../data-access/store/print-lead-local-storage.store';
import { PrintLeadStore } from '../data-access/store/print-lead.store';
import { UserWidgetComponent } from '@shared/ui/component/app-user-widget.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { Role } from '@shared/data-access/model/api/enum/role';
import { AuthStore } from 'src/app/auth/auth.store';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';

@Component({
  selector: 'app-print-lead',
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
              'PRINT_LEAD.UI.PRINT_LEAD' | translate
            }}</span>
          </div>

          <app-user-widget />
        </div>
        <div class="tw-flex tw-justify-between tw-items-center tw-bg-primary tw-h-8 tw-px-4">
          <nz-breadcrumb class="tw-mb-1 tw-text-white">
            <nz-breadcrumb-item class="tw-uppercase" (click)="prStore.scanGoBack()"
              ><span class="tw-underline tw-cursor-pointer tw-text-white tw-font-semibold">{{
                'PRINT_LEAD.BREAD_CRUMB.PRINT_LEAD' | translate
              }}</span></nz-breadcrumb-item
            >
            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) === false || (isNextScan$ | async)"
              >{{ 'PRINT_LEAD.BREAD_CRUMB.SCAN_ITEM' | translate }}</nz-breadcrumb-item
            >

            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) && (isNextScan$ | async) === false"
              >{{ prStore.scanItemForm.controls.barcode.value }}</nz-breadcrumb-item
            >
            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) && (isScanStatus$ | async) === false && (isNextScan$ | async) === false"
              >{{ 'PRINT_LEAD.BREAD_CRUMB.SCAN_LOCATION' | translate }}</nz-breadcrumb-item
            >
            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) && (isScanStatus$ | async) && (isNextScan$ | async) === false"
              >{{ 'PRINT_LEAD.BREAD_CRUMB.SCAN_STATUS_CODE' | translate }}</nz-breadcrumb-item
            >
            <nz-breadcrumb-item
              class="tw-uppercase tw-text-white tw-font-semibold"
              *ngIf="(isScan$ | async) && prStore.isShowReason && (isNextScan$ | async) === false"
              >{{ 'PRINT_LEAD.BREAD_CRUMB.REASON' | translate }}</nz-breadcrumb-item
            >
          </nz-breadcrumb>

          <div
            class="tw-flex tw-items-center tw-justify-end"
            *ngIf="!!prStore.factoryForm.controls.factoryId.value && !!prStore.stationForm.controls.stationId.value">
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
        <div
          class="tw-flex tw-justify-end tw-items-baseline tw-gap-6"
          *ngIf="((isScan$ | async) === false && !prStore.isShowReason) || (isNextScan$ | async)">
          <div class="tw-flex tw-flex-col tw-justify-center tw-w-2/4">
            <div
              class="tw-flex tw-items-center tw-justify-center tw-bg-yellow-300"
              *ngIf="(printLeadScanItem$ | async)!.isPriority && (isScan$ | async)">
              <div class="tw-font-bold tw-text-2xl tw-uppercase">{{ 'PRINT_LEAD.UI.PRIORITY' | translate }}</div>
            </div>
            <div
              class="tw-flex tw-items-center tw-justify-center tw-bg-blue-500 tw-mt-2"
              *ngIf="(printLeadScanItem$ | async)!.isJit && (isScan$ | async)">
              <div class="tw-font-bold tw-text-2xl tw-uppercase tw-text-white">{{ 'PRINT_LEAD.UI.JIT' | translate }}</div>
            </div>
          </div>

          <form nz-form [formGroup]="prStore.scanItemForm" class="tw-flex tw-justify-center tw-pb-1 tw-w-1/3">
            <nz-form-item nz-row nzGutter="30" class="tw-mb-0 tw-w-[500px]">
              <nz-form-label nzNoColon class="tw-flex tw-items-center tw-justify-end tw-h-[59px] tw-pb-[22px] tw-capitalize">
                <span class="tw-font-semibold tw-text-xl">{{ 'PRINT_LEAD.UI.SCAN_ITEM' | translate }}</span>
              </nz-form-label>
              <nz-form-control [nzSm]="24" [nzErrorTip]="barcodeScanErrorTpl">
                <input
                  type="text"
                  nz-input
                  [formControl]="prStore.scanItemForm.controls.barcode"
                  nzSize="large"
                  placeholder="{{ 'PRINT_LEAD.UI.ITEM' | translate }}"
                  appKeepFocus
                  (keyup.enter)="$event.preventDefault(); onScanBarcode()" />
                <ng-template #barcodeScanErrorTpl let-control>
                  <ng-container *ngIf="control.hasError('required')">{{ 'PRINT_LEAD.UI.FIELD_REQUIRED' | translate }}</ng-container>
                  <ng-container *ngIf="control.hasError('maxlength')">{{ 'BARCODE_MAXLENGTH' | translate }}</ng-container>
                </ng-template>
              </nz-form-control>
            </nz-form-item>
          </form>
          <div class="tw-pb-3 tw-w-1/3">
            <span *ngIf="!!(errScan$ | async)" class="tw-text-2xl tw-text-[#ff4d4f] tw-font-bold tw-break-words">{{
              (errScan$ | async)! | translate
            }}</span>
            <span *ngIf="!!(acceptMsg$ | async) && prStore.isSuccess" class="tw-text-2xl  tw-font-bold tw-text-green-500">{{
              (acceptMsg$ | async)! | translate
            }}</span>
          </div>
        </div>

        <nz-content class="tw-h-full tw-flex tw-flex-col" *ngIf="isScan$ | async">
          <nz-content *ngIf="(isNextScan$ | async) === false" class="tw-flex tw-justify-end tw-items-baseline tw-gap-6">
            <div class="tw-flex tw-flex-col tw-justify-center tw-w-2/4">
              <div class="tw-flex tw-items-center tw-justify-center tw-bg-yellow-300" *ngIf="(printLeadScanItem$ | async)!.isPriority">
                <div class="tw-font-bold tw-text-2xl tw-uppercase">{{ 'PRINT_LEAD.UI.PRIORITY' | translate }}</div>
              </div>
              <div class="tw-flex tw-items-center tw-justify-center tw-bg-blue-500 tw-mt-2" *ngIf="(printLeadScanItem$ | async)!.isJit">
                <div class="tw-font-bold tw-text-2xl tw-uppercase tw-text-white">{{ 'PRINT_LEAD.UI.JIT' | translate }}</div>
              </div>
            </div>

            <form
              nz-form
              [formGroup]="prStore.scanActionForm"
              *ngIf="!prStore.isShowReason"
              class="tw-flex tw-justify-center tw-pb-1 tw-w-1/3">
              <nz-form-item nz-row nzGutter="30" class="tw-mb-0 tw-w-[500px]">
                <nz-form-label nzNoColon class="tw-flex tw-items-center tw-justify-end tw-h-[59px] tw-pb-[20px]">
                  <span class="tw-font-semibold tw-text-xl" *ngIf="(isScanStatus$ | async) === false">{{
                    'PRINT_LEAD.UI.SCAN_LOCATION' | translate
                  }}</span>
                  <span class="tw-font-semibold tw-text-xl" *ngIf="isScanStatus$ | async">{{
                    'PRINT_LEAD.UI.SCAN_STATUS_CODE' | translate
                  }}</span>
                </nz-form-label>

                <nz-form-control [nzSm]="24" [nzErrorTip]="locationErrorTpl">
                  <input
                    type="text"
                    nz-input
                    [formControl]="prStore.scanActionForm.controls.actionBarcode"
                    nzSize="large"
                    placeholder="{{ 'PRINT_LEAD.UI.SCAN_LOCATION' | translate }}"
                    (keyup.enter)="prStore.scanLocation()"
                    appKeepFocus
                    focusOnInitOnly
                    *ngIf="(isScanStatus$ | async) === false" />
                  <input
                    type="text"
                    nz-input
                    [formControl]="prStore.scanActionForm.controls.actionBarcode"
                    nzSize="large"
                    (keyup.enter)="prStore.scanStatus()"
                    appKeepFocus
                    focusOnInitOnly
                    placeholder="{{ 'PRINT_LEAD.UI.SCAN_STATUS_CODE' | translate }}"
                    *ngIf="isScanStatus$ | async" />
                  <ng-template #locationErrorTpl let-control>
                    <ng-container *ngIf="control.hasError('required')">{{ 'PRINT_LEAD.UI.FIELD_REQUIRED' | translate }}</ng-container>
                  </ng-template>
                </nz-form-control>
              </nz-form-item>
            </form>

            <form
              nz-form
              [formGroup]="prStore.scanActionBodyForm"
              *ngIf="prStore.isShowReason && (isScan$ | async)"
              class="tw-flex tw-justify-center tw-pb-1 tw-w-1/3">
              <nz-form-item nz-row nzGutter="30" class="tw-mb-0 tw-w-[500px]">
                <nz-form-label nzNoColon class="tw-flex tw-items-center tw-justify-end tw-h-[59px] tw-pb-[20px]">
                  <span class="tw-font-semibold tw-text-xl">{{ 'PRINT_LEAD.UI.REASON' | translate }}</span>
                </nz-form-label>

                <nz-form-control [nzSm]="24" [nzErrorTip]="reasonErrorTpl">
                  <input
                    type="text"
                    nz-input
                    [formControl]="prStore.scanActionBodyForm.controls.reason"
                    nzSize="large"
                    placeholder="{{ 'PRINT_LEAD.UI.REASON' | translate }}"
                    appKeepFocus
                    focusOnInitOnly
                    (keyup.enter)="prStore.enterReason()" />
                  <ng-template #reasonErrorTpl let-control>
                    <div *ngIf="control.hasError('required')">{{ 'PRINT_LEAD.UI.FIELD_REQUIRED' | translate }}</div>
                    <div *ngIf="control.hasError('maxlength')">{{ 'REASON_MAXLENGTH' | translate }}</div>
                    <div *ngIf="control.hasError('minlength')">{{ 'REASON_MINLENGTH_20' | translate }}</div>
                    <div *ngIf="control.hasError('hasTrk')">{{ 'REASON_HAS_TRK' | translate }}</div>
                  </ng-template>
                </nz-form-control>
              </nz-form-item>
            </form>

            <div class="tw-pb-3 tw-w-1/3">
              <span
                *ngIf="!!(acceptMsg$ | async)"
                class="tw-text-2xl tw-font-bold  {{ prStore.isSuccess ? 'tw-text-green-500' : 'tw-text-[#ff4d4f]' }}"
                >{{ (acceptMsg$ | async)! | translate }}</span
              >
            </div>
          </nz-content>

          <nz-content class="tw-h-full">
            <nz-content class="tw-p-2 tw-flex tw-gap-x-8 tw-h-full" *ngIf="printLeadScanItem$ | async as printLeadScanItem">
              <nz-content class="tw-w-[500px] tw-max-w-[500px] tw-inline-flex tw-flex-col">
                <div class="tw-mb-3 tw-text-xl">
                  <nz-content>
                    @if (printLeadScanItem.preQrCode) {
                      <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.PREQRCODE' | translate }} : </span>
                      <span> {{ printLeadScanItem.preQrCode }}</span>
                    } @else {
                      <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.BARCODE' | translate }} : </span>
                      <span> {{ printLeadScanItem.barcode }}</span>
                    }
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.SKU' | translate }} : </span>
                    <span> {{ printLeadScanItem.sku }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.QUANTITY' | translate }} : </span>
                    <span> {{ printLeadScanItem.quantity }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.PARTNER_ID' | translate }} : </span>
                    <span> {{ printLeadScanItem.partnerId }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.ORDER' | translate }} : </span>
                    <span> {{ printLeadScanItem.orderId }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.PARTNER_ORDER' | translate }} : </span>
                    <span> {{ printLeadScanItem.partnerOrderId }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.STYLE' | translate }} : </span>
                    <span> {{ printLeadScanItem.style }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.COLOR' | translate }} : </span>
                    <span> {{ printLeadScanItem.color }}</span>
                  </nz-content>
                  <nz-content>
                    <span class="tw-font-bold tw-text-red-500 tw-text-3xl tw-inline-block">{{ 'PRINT_LEAD.UI.SIZE' | translate }} : </span>
                    <span class="tw-font-bold tw-text-red-500 tw-text-3xl"> {{ printLeadScanItem.size }}</span>
                  </nz-content>
                  <nz-content class="tw-pb-3">
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.TYPE' | translate }} : </span>
                    <span> {{ printLeadScanItem.type }}</span>
                  </nz-content>
                </div>
                <nz-content class="tw-border-black tw-border-solid tw-border tw-relative tw-py-4" *ngIf="printLeadScanItem.neckLabelImage">
                  <label
                    class="tw-absolute -tw-top-3 tw-bg-white tw-border tw-border-solid tw-text-sm tw-px-2 tw-font-semibold tw-left-5 tw-capitalize"
                    >{{ 'NECK_LABEL.NECK_LABEL' | translate }}</label
                  >
                  <img class="tw-relative tw-object-contain" ngSrc="{{ printLeadScanItem.neckLabelImage }}" [fill]="true" />
                </nz-content>
              </nz-content>
              <nz-content class="tw-flex-1 tw-h-full tw-flex tw-flex-col">
                <div class="tw-flex tw-gap-x-3 tw-text-xl tw-items-center tw-mb-6">
                  <nz-content class="tw-w-2/5">
                    <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.ITEM_STATUS' | translate }} : </span>
                    <span class="tw-uppercase"> {{ printLeadScanItem.statusName }}</span>
                  </nz-content>
                </div>

                <nz-content class="tw-border-black tw-border-solid tw-border tw-relative">
                  <nz-tabset nzType="card" class="tw-h-full" nzSize="large" [nzTabBarGutter]="5" [nzSelectedIndex]="prStore.activeTabIndex">
                    <nz-tab *ngFor="let tab of printLeadScanItem.printItems" [nzTitle]="titleTemplate">
                      <ng-template #titleTemplate>
                        <div
                          class="tw-px-3 tw-h-6 tw-font-semibold tw-text-sm tw-text-black"
                          [ngClass]="{
                            'tw-bg-white tw-border tw-border-solid': !tab.isPrinted && !tab.isPrintQaSuccessStatus,
                            'tw-bg-yellow-300': tab.isPrinted,
                            'tw-bg-green-500': tab.isPrintQaSuccessStatus,
                          }">
                          {{ tab.description }}
                        </div>
                      </ng-template>

                      <div class="tw-flex tw-items-center tw-gap-x-3 tw-p-2 tw-mt-3">
                        <button
                          *ngIf="!printLeadScanItem.isStickerPrint && !printLeadScanItem.isMugPrint"
                          nz-button
                          nzType="default"
                          (click)="detailImage(tab.id, printLeadScanItem.orderDetailUnitId)"
                          class="tw-bg-[#21b2b8e6] tw-text-white tw-border-transparent tw-rounded-sm tw-font-semibold tw-cursor-pointer tw-capitalize">
                          {{ 'PRINT_LEAD.UI.SHOW_DETAILS' | translate }}
                        </button>
                        <button
                          nz-button
                          nzType="default"
                          *ngIf="tab.isPrinted"
                          class="tw-bg-[#21b2b8e6] tw-text-white tw-border-transparent tw-rounded-sm tw-font-semibold tw-cursor-pointer tw-capitalize tw-hidden">
                          {{ 'PRINT_LEAD.UI.REPROCESS_IMAGE' | translate }}
                        </button>
                        <button
                          nz-button
                          nzType="default"
                          *ngIf="tab.isProcessed"
                          (click)="prStore.onResetItem(printLeadScanItem.barcode, tab.location)"
                          class="tw-bg-[#d73737e6] tw-text-white tw-border-transparent tw-rounded-sm tw-font-semibold tw-cursor-pointer tw-capitalize">
                          {{ 'PRINT_LEAD.UI.RESET_PRINT_STATUS' | translate }}
                        </button>
                      </div>
                      <div class="tw-h-[calc(100%-55px)] tw-relative">
                        <div class="box-image-custom-content tw-mb-3">
                          <nz-content *ngIf="printLeadScanItem.customNumber">
                            <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.CUSTOM_NUMBER' | translate }} : </span>
                            <span> {{ printLeadScanItem.customNumber }}</span>
                          </nz-content>
                          <nz-content *ngIf="printLeadScanItem.customName">
                            <span class="tw-font-semibold tw-inline-block">{{ 'PRINT_LEAD.UI.CUSTOM_NAME' | translate }} : </span>
                            <span> {{ printLeadScanItem.customName }}</span>
                          </nz-content>
                        </div>
                        <div class="tw-image-fill tw-bg-white tw-h-[95%] tw-pb-2">
                          <img [src]="tab.previewUrl" appPreviewImage />
                        </div>
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
      :host ::ng-deep .box-image {
        position: relative;
      }
      :host ::ng-deep .box-image-custom-content {
        position: absolute;
        right: 5%;
        z-index: 1;
        width: 230px;
        font-size: 18px;
      }
    `,
  ],
  providers: [provideComponentStore(PrintLeadStore), PrintLeadLocalStorageStore],
  imports: [
    // Angular
    RouterModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    NgFor,
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
    NzButtonModule,
    KeepFocusDirective,
    ImgPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintLeadComponent implements OnInit {
  mdTitleFactory: string = this._translateSvc.instant('PRINT_LEAD.UI.FACTORY');
  mdTitleStation: string = this._translateSvc.instant('PRINT_LEAD.UI.STATION');
  mdTitleDetailImage: string = this._translateSvc.instant('PRINT_LEAD.UI.IMAGE_INFO');

  translateStore = inject(TranslateStore);
  authStore = inject(AuthStore);
  prStore = inject(PrintLeadStore);
  stStore = inject(PrintLeadLocalStorageStore);

  printLeadScanItem$!: Observable<PrintLeadScanItem.Response>;
  factoryName$!: Observable<string>;
  stationName$!: Observable<string>;
  factoryData$!: Observable<UserFactoriesGetApi.Response>;
  stationData$!: Observable<StationsGetApi.Response>;
  isScan$!: Observable<boolean>;
  isScanStatus$!: Observable<boolean>;
  errScan$!: Observable<string>;
  acceptMsg$!: Observable<string>;
  $currLang = this.translateStore.selectSignal(s => s.currentLang);
  isNextScan$!: Observable<boolean>;

  isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _nzModalSvc: NzModalService,
    private readonly _translateSvc: TranslateService,
    private readonly _lsStore: LocalStorageStore
  ) {}

  ngOnInit(): void {
    if (!this.stStore.getSelectedFactory() && !!this._lsStore.getToken() && !this.prStore.isHiddenFactory) {
      this.factorySelectItem(this.mdTitleFactory);
    }

    if (this.stStore.getSelectedFactory() && !this.stStore.getSelectedStation() && !!this._lsStore.getToken()) {
      this.stationSelectItem(this.mdTitleStation);
    }

    this.printLeadScanItem$ = this.prStore.select(s => s.printLeadScanItem);
    this.factoryName$ = this.prStore.select(s => s.factoryName);
    this.factoryData$ = this.prStore.select(s => s.factoriesData);
    this.stationData$ = this.prStore.select(s => s.stationsData);
    this.isScan$ = this.prStore.select(s => s.isScan);
    this.isScanStatus$ = this.prStore.select(s => s.isScanStatus);
    this.stationName$ = this.prStore.select(s => s.stationName);
    this.errScan$ = this.prStore.select(s => s.errScan);
    this.acceptMsg$ = this.prStore.select(s => s.acceptMsg);
    this.isNextScan$ = this.prStore.select(s => s.isNextScan);
  }

  onScanBarcode() {
    if (this.prStore.scanItemForm.controls.barcode.value.trim().length === 0 || this.prStore.scanItemForm.controls.barcode.invalid) return;
    this.prStore.scanItem();
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
      nzContent: PrintLeadFactoryComponent,
      nzCancelDisabled: true,
      nzClosable: true,
      nzAutofocus: null,
      nzOnCancel: () => {
        modalRef.destroy();
        this.stStore.removeSelectedFactory();
        this.authStore.signOut();
      },
    });
    modalRef.componentInstance!.prStore = this.prStore;
    modalRef.componentInstance!.authStore = this.authStore;
    modalRef.componentInstance!.stStore = this.stStore;

    modalRef
      .componentInstance!.clickSubmit.pipe(
        tap(() => {
          modalRef.destroy();
          this.stationSelectItem(this.mdTitleStation);
          this.prStore.getStationList();
        })
      )
      .subscribe();
  }

  onChangeStation(value: number) {
    if (this.stStore.getSelectedStation() === value) return;
    this.prStore.stationForm.controls.stationId.setValue(value);
    this.stStore.setSelectedStation(value);
    this.prStore.stationSetName();
  }

  onChangeFactory(value: number) {
    if (this.stStore.getSelectedFactory() === value) return;
    this.prStore.factoryForm.controls.factoryId.setValue(value);
    this.prStore.stationForm.controls.stationId.reset();
    this.stationSelectItem(this.mdTitleStation);
    this.prStore.scanGoBack();
    this.prStore.getStationList();
  }

  stationSelectItem(modalTitle: string) {
    const modalRef = this._nzModalSvc.create({
      nzTitle: modalTitle,
      nzContent: PrintLeadStationComponent,
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
    modalRef.componentInstance!.prStore = this.prStore;
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

  detailImage(id: number, orderDetailUnitId: number) {
    const modalRef = this._nzModalSvc.create({
      nzTitle: this.mdTitleDetailImage,
      nzContent: PrintLeadDetailComponent,
      nzCancelDisabled: true,
      nzClosable: false,
      nzWidth: '650px',
      nzFooter: [
        {
          label: this._translateSvc.instant('CLOSE'),
          onClick: () => {
            modalRef.destroy();
          },
        },
      ],
    });
    modalRef.componentInstance!.prStore = this.prStore;
    modalRef.componentInstance!.attrId = id;
    modalRef.componentInstance!.orderDetailUnitId = orderDetailUnitId;
  }

  switchLanguage(langCode: AvailableLanguage) {
    this.translateStore.useLang(langCode);
  }

  protected readonly AvailableLanguage = AvailableLanguage;
}
