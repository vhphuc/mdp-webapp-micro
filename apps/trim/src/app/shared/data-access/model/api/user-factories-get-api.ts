import { Factory } from '@shared/data-access/model/api/enum/factory';

export namespace UserFactoriesGetApi {
  export type Response = ResponseItem[];

  export type ResponseItem = {
    id: Factory;
    name: string;
  };
}
