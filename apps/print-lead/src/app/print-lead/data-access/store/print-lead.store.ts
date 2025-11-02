import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { ComponentStore, OnStoreInit } from '@ngrx/component-store';
import { EMPTY, of, pipe, switchMap, tap } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { AbstractControl, NonNullableFormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { TranslateStore } from '@shared/data-access/store/translate.store';
import { PrintLeadLocalStorageStore } from './print-lead-local-storage.store';
import { PrintLeadService } from '../api/print-lead.service';
import { PrintLeadForm, PrintLeadScanItem } from '../model/print-lead.model';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { ActivatedRoute } from '@angular/router';
import {
  extractDtfQrcode,
  extractHatBarcode,
  extractJitItemBarcode,
  extractMugBarcode,
  extractUnitBarcode,
  isHatBarcode,
} from '@shared/util/helper/extract-barcode';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { GlobalSpinnerStore } from '@shared/ui/component/global-spinner/global-spinner.store';

export interface PrintLeadState {
  factoriesData: UserFactoriesGetApi.Response;
  stationsData: StationsGetApi.Response;
  printLeadScanItem: PrintLeadScanItem.Response;
  factoryName: string;
  stationName: string;
  isScan: boolean;
  isScanStatus: boolean;
  isNextScan: boolean;
  errScan: string;
  acceptMsg: string;
}

const initialState: PrintLeadState = {
  factoriesData: [],
  stationsData: [],
  printLeadScanItem: {
    quantity: 0,
    sku: '',
    barcode: '',
    partnerId: 0,
    partnerOrderId: '',
    orderId: 0,
    batchId: '',
    style: '',
    color: '',
    size: '',
    type: '',
    status: 0,
    statusName: '',
    neckLabelImage: '',
    isPriority: false,
    printItems: [],
    customNumber: '',
    customName: '',
    isMugPrint: false,
    isStickerPrint: false,
    isJit: false,
    isDtfAccessory: false,
    isEmbroideredPrint: false,
    preQrCode: '',
    orderDetailUnitId: 0,
    barcodeConfigurations: [],
  },
  factoryName: '',
  stationName: '',
  isScan: false,
  isScanStatus: false,
  isNextScan: false,
  errScan: '',
  acceptMsg: '',
};

@Injectable()
export class PrintLeadStore extends ComponentStore<PrintLeadState> implements OnStoreInit {
  stStore = inject(PrintLeadLocalStorageStore);
  translate = inject(TranslateStore);
  globalSpinnerStore = inject(GlobalSpinnerStore);
  isSuccess = false;
  isShowReason = false;
  isHiddenFactory = false;
  activeTabIndex = 0;

  loadding = this.globalSpinnerStore.selectSignal(s => s.loading);

  factoryForm = this._fb.group<PrintLeadForm.FactoryFormGroup>({
    factoryId: this._fb.control(this.stStore.getSelectedFactory()!),
  });

  stationForm = this._fb.group<PrintLeadForm.StationFormGroup>({
    stationId: this._fb.control(null, [Validators.required]),
  });

  scanItemForm = this._fb.group<PrintLeadForm.ScanItemFormGroup>({
    barcode: this._fb.control('', [Validators.required, Validators.maxLength(100)]),
  });

  scanActionForm = this._fb.group<PrintLeadForm.ScanActionFormGroup>({
    barcode: this._fb.control('', [Validators.required]),
    stationId: this._fb.control(this.stStore.getSelectedStation()!),
    actionBarcode: this._fb.control('', [Validators.required]),
    factoryId: this._fb.control(this.stStore.getSelectedFactory()!),
  });

  // MDP-3443: Don't allow entering "TRK..." values in manual art error description fields
  // Custom Validator
  noTrkValidator = (control: AbstractControl): ValidationErrors | null => {
    return control.value?.toLowerCase().includes('trk') ? { hasTrk: true } : null;
  };

  scanActionBodyForm = this._fb.group<PrintLeadForm.ScanActionBodyFormGroup>({
    reason: this._fb.control('', [Validators.required, Validators.minLength(20), Validators.maxLength(250), this.noTrkValidator]),
    locationBarcode: this._fb.control('', [Validators.required, Validators.maxLength(100)]),
    stationName: this._fb.control(''),
  });

  constructor(
    private readonly _fb: NonNullableFormBuilder,
    private readonly _pApiSvc: PrintLeadService,
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

  scanLocation() {
    if (!this.scanActionForm.controls.actionBarcode.value) return;
    const scanValue = this.scanActionForm.controls.actionBarcode.value.trim().toUpperCase();
    const printItems = this.selectSignal(s => s.printLeadScanItem.printItems)();
    if (printItems.filter(pi => pi.isAllowScan).every(pi => pi.locationBarcode.toUpperCase() !== scanValue)) {
      this.isSuccess = false;
      this.setAcceptMsg({ errorKey: 'PRINT_LEAD.UI.INVALID_LOCATION_CODE' });
      this.scanActionForm.controls.actionBarcode.reset();
      return;
    }
    this.setAcceptMsg({ errorKey: '' });
    this.scanActionBodyForm.controls.locationBarcode.setValue(this.scanActionForm.controls.actionBarcode.value);
    this.scanActionForm.controls.actionBarcode.reset();
    this.updateIsScanStatus(true);
  }

  enterReason() {
    if (this.scanActionBodyForm.controls.reason.invalid || this.scanActionBodyForm.controls.reason.value.trim().length === 0) return;
    this.setAcceptMsg({ errorKey: '' });
    this.scanItemAction();
  }

  scanStatus() {
    if (!this.scanActionForm.controls.actionBarcode.value) return;
    
    const scannedBarcode = this.scanActionForm.controls.actionBarcode.value.trim().toUpperCase();
    const barcodeConfigurations = this.state().printLeadScanItem.barcodeConfigurations;
    
    // Find the matching barcode configuration
    const matchingConfig = barcodeConfigurations.find(config => 
      config.barcodeValue.toUpperCase() === scannedBarcode
    );
    
    // Validation: Check if barcode exists in configurations
    if (!matchingConfig) {
      this.isSuccess = false;
      this.setAcceptMsg({ errorKey: 'PRINT_LEAD.UI.INVALID_BARCODE' });
      this.scanActionForm.controls.actionBarcode.reset();
      return;
    }
    
    // Validation: Check if barcode is active
    if (!matchingConfig.isActive) {
      this.isSuccess = false;
      this.setAcceptMsg({ errorKey: 'PRINT_LEAD.UI.INACTIVE_BARCODE' });
      this.scanActionForm.controls.actionBarcode.reset();
      return;
    }
    
    this.scanActionBodyForm.controls.reason.reset();
    
    // Check if manual input is required
    if (matchingConfig.isManualInput) {
      this.isShowReason = true;
      this.resetMsg();
    } else {
      this.isShowReason = false;
    }
    
    this.scanActionForm.controls.barcode.setValue(this.scanItemForm.controls.barcode.value);
    this.updateStationControl();
    
    if (!this.isShowReason) {
      this.scanItemAction();
    }
  }

  scanGoBack() {
    this.scanItemForm.controls.barcode.reset('', { emitEvent: false });
    this.isSuccess = false;
    this.isShowReason = false;
    this.updateIsScan(false);
    this.updateIsNextScan(false);
    this.setErrorScan({ errorKey: '' });
  }

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

  getStationList = this.effect<never>(
    pipe(
      switchMap(() =>
        this._pApiSvc.stationGetList('PrintLead', this.factoryForm.controls.factoryId.value, this.state().stationName).pipe(
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
    const scanValue = this.scanItemForm.controls.barcode.value.trim().toUpperCase();
    let barcode: string;
    if (scanValue.startsWith('DTF')) {
      barcode = extractDtfQrcode(scanValue);
    } else if (scanValue.startsWith('JIT')) {
      barcode = extractJitItemBarcode(scanValue);
    } else if (scanValue.startsWith('MUG')) {
      barcode = extractMugBarcode(scanValue);
    } else if (isHatBarcode(scanValue)) {
      barcode = extractHatBarcode(scanValue);
    } else {
      barcode = extractUnitBarcode(scanValue);
    }
    return barcode;
  }

  scanItem = this.effect<never>(
    pipe(
      filter(() => !this.loadding()),
      switchMap(() =>
        this._pApiSvc.scan(this.qrcodeToBarcode(), this.stStore.getSelectedFactory()!, this.state().stationName).pipe(
          tap({
            next: res => {
              if (!res.data) return;
              this.patchState({ printLeadScanItem: res.data });
              this.updateIsScan(true);
              this.resetMsg();
              this.setValueAction();
              this.scanItemForm.controls.barcode.setValue(this.qrcodeToBarcode());
              if (res.data.preQrCode) {
                this.scanItemForm.controls.barcode.setValue(res.data.preQrCode);
              }
              this.isSuccess = false;
              if (res.data.printItems.filter(pi => pi.isAllowScan).length === 1) {
                this.updateIsScanStatus(true);
                const item = res.data.printItems.find(pi => pi.isAllowScan)!;
                this.scanActionBodyForm.controls.locationBarcode.setValue(item.locationBarcode);
              } else {
                this.updateIsScanStatus(false);
              }
              // Set active tab index
              const activeTabIndex = res.data.printItems.findIndex(pi => pi.isAllowScan);
              this.activeTabIndex = activeTabIndex !== -1 ? activeTabIndex : 0;
              // update next scan
              this.updateIsNextScan(false);
              this.isShowReason = false;
            },
          }),
          catchError((error: ErrorResult) => {
            this.scanItemForm.controls.barcode.reset();
            this.setErrorScan(error);
            this.setAcceptMsg({ errorKey: '' });
            this.isSuccess = false;
            this.isShowReason = false;
            this.updateIsScan(false);
            this.updateIsNextScan(false);
            return of('');
          })
        )
      )
    )
  );

  resetMsg() {
    this.setErrorScan({ errorKey: '' });
    this.setAcceptMsg({ errorKey: '' });
  }

  setValueAction() {
    this.scanActionForm.controls.actionBarcode.reset();
    this.scanActionForm.controls.stationId.setValue(this.stStore.getSelectedStation()!);
    this.scanActionForm.controls.factoryId.setValue(this.stStore.getSelectedFactory()!);
  }

  onResetItem(barcode: string, location: string) {
    const payload = { barcode: barcode, location: location };
    this.resetItem(payload);
  }

  readonly scanItemAction = this.effect($params =>
    $params.pipe(
      filter(() => !this.loadding()),
      switchMap(() =>
        this._pApiSvc
          .scanItemAction(
            PrintLeadForm.mapModelParam(this.scanActionForm),
            PrintLeadForm.mapModelBody(this.scanActionBodyForm),
            this.state().stationName
          )
          .pipe(
            tap({
              next: resp => {
                this.setAcceptMsg({ errorKey: resp.message, paramError: resp.paramSuccess });
                this.updateStatusName(resp.paramSuccess['statusName'] as string);
                this.isSuccess = true;
                this.updateIsNextScan(true);
                this.scanActionForm.controls.barcode.reset();
                this.scanItemForm.controls.barcode.reset();
              },
            }),
            catchError((error: ErrorResult) => {
              this.isSuccess = false;
              this.scanActionForm.controls.barcode.reset();
              this.scanActionForm.controls.actionBarcode.reset();
              this.setAcceptMsg(error);
              return of('');
            })
          )
      )
    )
  );

  readonly resetItem = this.effect<{ barcode: string; location: string }>($params =>
    $params.pipe(
      filter(() => !this.loadding()),
      switchMap(params =>
        this._pApiSvc.resetItem(params.barcode, params.location, this.state().stationName, {
          stationId: this.stationForm.controls.stationId.value ?? 0,
          stationName: this.state().stationName
        }).pipe(
          tap({
            next: resp => {
              this.setAcceptMsg({ errorKey: resp.message });
              this.isSuccess = true;
              this.updateIsProcessed(params.location);
            },
          }),
          catchError((error: ErrorResult) => {
            this.setAcceptMsg(error);
            this.isSuccess = false;
            return of('');
          })
        )
      )
    )
  );

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
    this.scanActionBodyForm.controls.stationName.setValue(
      state.stationsData.find(station => station.id === this.stStore.getSelectedStation())!.stationName
    );
    return { ...state };
  });

  updateStatusName = this.updater((state, statusName: string) => {
    state.printLeadScanItem.statusName = statusName;
    return { ...state };
  });

  updateIsProcessed = this.updater((state, location: string) => {
    state.printLeadScanItem.printItems.find(item => item.location === location)!.isProcessed = false;
    return { ...state };
  });

  updateIsScanStatus = this.updater((state, isScan: boolean) => {
    state.isScanStatus = isScan;
    return { ...state };
  });

  updateIsNextScan = this.updater((state, isNextScan: boolean) => {
    state.isNextScan = isNextScan;
    return { ...state };
  });
}
