import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { StationType } from '@shared/data-access/model/api/enum/station-type';

export namespace TrimStationGetApi {
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
