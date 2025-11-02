import { FormControl, FormGroup } from '@angular/forms';

export namespace WashingForm {
  export type FactoryFormGroup = {
    factoryId: FormControl<number>;
  };

  export type StationFormGroup = {
    stationId: FormControl<number | null>;
  };

  export type ScanFormGroup = {
    barcode: FormControl<string>;
  };
  export type WashingFormGroup = {
    barcode: FormControl<string>;
    stationId: FormControl<number>;
    barcodeAction: FormControl<string>;
    factoryId: FormControl<number>;
  };

  export type WashingBodyFormGroup = {
    quantity: FormControl<number>;
    stationName: FormControl<string>;
  };

  export function mapModelParam(frm: FormGroup<WashingFormGroup>): WashingScanItem.RequestParam {
    const formValue = frm.getRawValue();
    return {
      barcode: formValue.barcode.trim(),
      stationId: formValue.stationId,
      barcodeAction: formValue.barcodeAction.trim(),
      factoryId: formValue.factoryId,
    };
  }

  export function mapModelBody(frm: FormGroup<WashingBodyFormGroup>): WashingScanItem.RequestBody {
    const formValue = frm.getRawValue();
    return {
      quantity: formValue.quantity,
      stationName: formValue.stationName,
    };
  }
}

export namespace WashingScanItem {
  export interface RequestParam {
    barcode: string;
    stationId: number;
    barcodeAction: string;
    factoryId: number;
  }
  export interface RequestBody {
    quantity: number;
    stationName: string;
  }

  export interface Response {
    batchTicketId: string;
    sku: string;
    barcode: string;
    quantity: number;
    partnerId: number;
    partnerOrderId: string;
    orderId: number;
    style: string;
    color: string;
    size: string;
    type: string;
    status: number;
    statusName: string;
    isPriority: boolean;
    neckLabelImage: string;
    washItems: WashItems[];
    preQrCode: string | null;
  }

  export interface WashItems {
    id: number;
    code: string;
    location: string;
    previewUrl: string;
    fileUrl: string;
    isPrinted: boolean;
    status: number;
    description: string;
  }
}
