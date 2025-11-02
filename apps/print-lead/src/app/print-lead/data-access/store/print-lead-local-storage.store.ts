import { Injectable } from '@angular/core';
import { lsGetKey, lsSetKey, lsRemoveKey } from '@shared/util/helper/local-storage-query';

@Injectable()
export class PrintLeadLocalStorageStore {
  selectedFactoryKey = 'factoryPrintLead';
  getSelectedFactory() {
    return lsGetKey<number>(this.selectedFactoryKey);
  }
  setSelectedFactory(value: number) {
    lsSetKey(this.selectedFactoryKey, value);
  }
  removeSelectedFactory() {
    lsRemoveKey(this.selectedFactoryKey);
  }

  selectedStationKey = 'stationPrintLead';
  getSelectedStation() {
    return lsGetKey<number>(this.selectedStationKey);
  }
  setSelectedStation(value: number | null) {
    lsSetKey(this.selectedStationKey, value);
  }
  removeSelectedStation() {
    lsRemoveKey(this.selectedStationKey);
  }
}
