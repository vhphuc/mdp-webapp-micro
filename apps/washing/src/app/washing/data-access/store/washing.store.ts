import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { ComponentStore, OnStoreInit } from '@ngrx/component-store';
import { EMPTY, of, pipe, switchMap, tap } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { TranslateStore } from '@shared/data-access/store/translate.store';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { WashingLocalStorageStore } from './washing-local-storage.store';
import { WashingForm, WashingScanItem } from '../model/washing.model';
import { WashingService } from '../api/washing.service';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';
import { ActivatedRoute } from '@angular/router';
import { extractJitItemBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { GlobalSpinnerStore } from '@shared/ui/component/global-spinner/global-spinner.store';
import { StationApiService } from '@shared/data-access/api/station-api.service';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';

export interface WashingState {
  factoriesData: UserFactoriesGetApi.Response;
  stationsData: StationsGetApi.Response;
  washingScanItem: WashingScanItem.Response;
  profileName: string;
  factoryName: string;
  stationName: string;
  isScan: boolean;
  isScanFixCode: boolean;
  isNextScan: boolean;
  errScan: string;
  acceptMsg: string;
}

const initialState: WashingState = {
  factoriesData: [],
  stationsData: [],
  washingScanItem: {
    quantity: 0,
    sku: '',
    barcode: '',
    partnerId: 0,
    partnerOrderId: '',
    orderId: 0,
    batchTicketId: '',
    style: '',
    color: '',
    size: '',
    type: '',
    status: 0,
    statusName: '',
    neckLabelImage: '',
    isPriority: false,
    washItems: [],
    preQrCode: '',
  },
  factoryName: '',
  stationName: '',
  profileName: '',
  isScan: false,
  isScanFixCode: false,
  isNextScan: false,
  errScan: '',
  acceptMsg: '',
};

@Injectable()
export class WashingStore extends ComponentStore<WashingState> implements OnStoreInit {
  stStore = inject(WashingLocalStorageStore);
  translate = inject(TranslateStore);
  globalSpinnerStore = inject(GlobalSpinnerStore);
  isSuccess = false;
  isHiddenFactory = false;
  activeTabIndex = 0;

  loadding = this.globalSpinnerStore.selectSignal(s => s.loading);

  factoryForm = this._fb.group<WashingForm.FactoryFormGroup>({
    factoryId: this._fb.control(this.stStore.getSelectedFactory()!),
  });

  stationForm = this._fb.group<WashingForm.StationFormGroup>({
    stationId: this._fb.control(null, [Validators.required]),
  });

  scanItemForm = this._fb.group<WashingForm.ScanFormGroup>({
    barcode: this._fb.control('', [Validators.required, Validators.maxLength(100)]),
  });

  washingForm = this._fb.group<WashingForm.WashingFormGroup>({
    barcode: this._fb.control('', [Validators.required, Validators.maxLength(100)]),
    stationId: this._fb.control(this.stStore.getSelectedStation()!),
    barcodeAction: this._fb.control('', [Validators.required, Validators.maxLength(100)]),
    factoryId: this._fb.control(this.stStore.getSelectedFactory()!),
  });

  washingBodyForm = this._fb.group<WashingForm.WashingBodyFormGroup>({
    quantity: this._fb.control({ value: 0, disabled: true }),
    stationName: this._fb.control(''),
  });

  constructor(
    private readonly _fb: NonNullableFormBuilder,
    private readonly _wApiSvc: WashingService,
    private readonly _stationApiSvc: StationApiService,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super(initialState);
  }

  ngrxOnStoreInit() {
    this.stationForm.controls.stationId.setValue(this.stStore.getSelectedStation());
    this.#getFactories();
    this.#onChangeFactory();
    this.#onChangeStation();
  }

  readonly #onChangeFactory = this.effect<never>(
    pipe(
      switchMap(() => this.factoryForm.controls.factoryId.valueChanges),
      tap(() => {
        this.factorySetName();
      })
    )
  );

  readonly #onChangeStation = this.effect<never>(
    pipe(
      switchMap(() => this.stationForm.controls.stationId.valueChanges),
      tap(() => {
        this.stationSetName();
      })
    )
  );

  readonly #getFactories = this.effect<never>(
    pipe(
      switchMap(() => this._activatedRoute.data),
      tap(({ factories }) => {
        const factoriesData = factories as UserFactoriesGetApi.Response;
        this.patchState({ factoriesData: factoriesData });
        if (!this.stStore.getSelectedFactory() && factoriesData.length === 1) {
          this.factoryForm.controls.factoryId.setValue(factoriesData[0].id);
          this.stStore.setSelectedFactory(factoriesData[0].id);
        } else {
          this.factoryForm.controls.factoryId.setValue(this.stStore.getSelectedFactory()!);
        }
        this.factorySetName();
        this.getStationList();

        if (factoriesData.length === 1) {
          this.isHiddenFactory = true;
        }
      })
    )
  );

  scanGoBack() {
    this.scanItemForm.controls.barcode.reset('', { emitEvent: false });
    this.isSuccess = false;
    this.updateIsScan(false);
    this.updateIsNextScan(false);
    this.setErrorScan({ errorKey: '' });
  }

  onWashStation() {
    if (!this.washingForm.controls.barcodeAction.value || this.washingForm.controls.barcodeAction.invalid) return;
    this.washingForm.controls.barcode.setValue(this.scanItemForm.controls.barcode.value);
    this.updateStationControl();
    this.washStation();
  }

  getStationList = this.effect<never>(
    pipe(
      switchMap(() =>
        this._stationApiSvc.stationsGet(this.factoryForm.controls.factoryId.value, <StationRole>'WashStation').pipe(
          tap({
            next: res => {
              this.patchState({ stationsData: res.data });
              this.stationSetName();
            },
          }),
          catchError(() => EMPTY)
        )
      )
    )
  );

  qrcodeToBarcode() {
    const scanValue = this.scanItemForm.controls.barcode.value.trim();
    let barcode: string;
    if (scanValue.startsWith('JIT')) {
      barcode = extractJitItemBarcode(scanValue);
    } else {
      barcode = extractUnitBarcode(scanValue);
    }
    return barcode;
  }

  scanItem = this.effect<never>(
    pipe(
      filter(() => !this.loadding()),
      switchMap(() =>
        this._wApiSvc.scan(this.qrcodeToBarcode(), this.stStore.getSelectedFactory()!, this.state().stationName).pipe(
          tap({
            next: res => {
              this.patchState({ washingScanItem: res.data });
              this.updateIsScan(true);
              this.setErrorScan({ errorKey: '' });
              this.setAcceptMsg({ errorKey: '' });
              this.washingForm.controls.barcodeAction.reset();
              this.scanItemForm.controls.barcode.setValue(this.qrcodeToBarcode());
              if (res.data?.preQrCode) {
                this.scanItemForm.controls.barcode.setValue(res.data.preQrCode);
              }
              this.washingForm.controls.stationId.setValue(this.stStore.getSelectedStation()!);
              this.washingForm.controls.factoryId.setValue(this.stStore.getSelectedFactory()!);
              this.washingBodyForm.controls.quantity.setValue(res.data!.quantity);
              if (res.data!.status === ItemTransitionStatus.Washing) {
                this.updateIsScanFixCode(true);
              } else {
                this.updateIsScanFixCode(false);
              }
              this.updateIsNextScan(false);
              // set active tab
              const activeTabIndex =
                res.data?.washItems.findIndex(item => {
                  return ![ItemTransitionStatus.QaSuccess, ItemTransitionStatus.QaFailure].includes(item.status);
                }) ?? 0;
              this.activeTabIndex = activeTabIndex === -1 ? 0 : activeTabIndex;
            },
          }),
          catchError((error: ErrorResult) => {
            this.setAcceptMsg({ errorKey: '' });
            this.scanItemForm.controls.barcode.reset();
            this.setErrorScan(error);
            this.updateIsScan(false);
            this.updateIsNextScan(false);
            return of('');
          })
        )
      )
    )
  );

  readonly washStation = this.effect($params =>
    $params.pipe(
      filter(() => !this.loadding()),
      switchMap(() =>
        this._wApiSvc
          .washStation(
            WashingForm.mapModelParam(this.washingForm),
            WashingForm.mapModelBody(this.washingBodyForm),
            this.state().stationName
          )
          .pipe(
            tap({
              next: resp => {
                this.washingForm.controls.barcode.reset();
                this.updateStatusName(resp.paramSuccess['itemStatus'] as string);
                this.setAcceptMsg({ errorKey: resp.message, paramError: resp.paramSuccess });
                this.isSuccess = !resp.paramSuccess['isWashFailed'];
                this.updateIsNextScan(true);
                this.scanItemForm.controls.barcode.reset();
              },
            }),
            catchError((error: ErrorResult) => {
              this.washingForm.controls.barcode.reset();
              this.washingForm.controls.barcodeAction.reset();
              this.setAcceptMsg(error);
              return of('');
            })
          )
      )
    )
  );

  updateStatusName = this.updater((state, statusName: string) => {
    state.washingScanItem.statusName = statusName;
    return { ...state };
  });

  readonly factorySetName = this.updater(state => {
    if (!this.factoryForm.controls.factoryId.value) {
      this.factoryForm.controls.factoryId.setValue(state.factoriesData[0].id);
    }
    state.factoryName = state.factoriesData.find(factory => factory.id === this.factoryForm.controls.factoryId.value)!.name;
    return { ...state };
  });

  readonly stationSetName = this.updater(state => {
    state.stationName = this.stationForm.controls.stationId.value
      ? state.stationsData.find(station => station.id === this.stationForm.controls.stationId.value)!.stationName
      : '';
    this._cdr.markForCheck();
    return { ...state };
  });

  readonly setErrorScan = this.updater<ErrorResult>((state, value: ErrorResult) => {
    this.translate.translate(value.errorKey, value.paramError).subscribe(res => (state.errScan = res));
    return { ...state };
  });

  readonly setAcceptMsg = this.updater<ErrorResult>((state, value: ErrorResult) => {
    this.translate.translate(value.errorKey, value.paramError).subscribe(res => (state.acceptMsg = res));
    return { ...state };
  });

  updateIsScan = this.updater((state, isScan: boolean) => {
    state.isScan = isScan;
    return { ...state };
  });

  updateStationControl = this.updater(state => {
    this.washingBodyForm.controls.stationName.setValue(
      state.stationsData.find(station => station.id === this.stStore.getSelectedStation())!.stationName
    );
    return { ...state };
  });

  updateIsScanFixCode = this.updater((state, isScan: boolean) => {
    state.isScanFixCode = isScan;
    return { ...state };
  });

  updateIsNextScan = this.updater((state, isNextScan: boolean) => {
    state.isNextScan = isNextScan;
    return { ...state };
  });
}
