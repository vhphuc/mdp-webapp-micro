import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { PrinterType } from '@shared/data-access/model/api/enum/printer-type';
import { PageSizeType } from '@shared/data-access/model/api/enum/page-size';

export namespace QaStationsGetApi {
  export type ResponseItem = {
    id: number;
    stationName: string;
    computerName: string;
    stationRole: StationRole;
    isActive: boolean;
    stationType: StationType;
    factoryId: Factory;
    factoryName: string;
  };

  export type Response = ResponseItem[];
}

export namespace QaPrintersGetApi {
  export type ResponseItem = {
    id: number;
    printerName: string;
    printerType: PrinterType;
    pageSize: PageSizeType;
    zones: string | null;
    serviceType: number; // might be some enum
    createdOnUtc: Date;
    updatedOnUtc: Date;
    factoryId: Factory;
    tpnPrinterId: string | null;
    pnPrinterId: string | null;
  };

  export type Response = ResponseItem[];
}
