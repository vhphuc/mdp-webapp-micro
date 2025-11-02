import { Role } from '@shared/data-access/model/api/enum/role';

export namespace ProfileGetApi {
  // comment field that r not used.
  export interface Response {
    id: number;
    firstName: string;
    lastName: string;
    roles: Role[];
    appName: string
  }
}
