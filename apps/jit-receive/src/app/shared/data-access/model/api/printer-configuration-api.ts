import { PrinterType } from '@shared/data-access/model/api/enum/printer-type';
import { PageSizeType } from '@shared/data-access/model/api/enum/page-size';
import { Factory } from '@shared/data-access/model/api/enum/factory';

export namespace PrintersGetApi {
  export type ResponseItem = {
    id: number;
    printerName: string;
    printerType: PrinterType;
    pageSize: PageSizeType;
    zones: string | null;
    serviceType: number; // might be some enum
    createdOnUtc: string;
    updatedOnUtc: string;
    factoryId: Factory;
    tpnPrinterId: string | null;
    pnPrinterId: string | null;
  };

  export type Response = ResponseItem[];
}
