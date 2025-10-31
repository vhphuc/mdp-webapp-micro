import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { Factory } from '@shared/data-access/model/api/enum/factory';

export namespace StationsGetApi {
  export type ResponseItem = {
    id: number;
    stationName: string;
    stationRole: StationRole;
    stationType: StationType;
    isPod: boolean;

    computerName: string;
    isActive: boolean;

    printerConfigurationId: number | null;
    printerName: string | null;

    factoryId: Factory;
    factoryName: string;
    warehouseId: number | null;
  };

  export type Response = ResponseItem[];
}
