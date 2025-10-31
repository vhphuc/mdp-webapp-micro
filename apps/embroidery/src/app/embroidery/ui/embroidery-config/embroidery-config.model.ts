export namespace EmbroideryStations {
  export type Response = ResponseItem[];

  export type ResponseItem = {
    id: number;
    stationName: string;
    stationType: number;
  };
}
