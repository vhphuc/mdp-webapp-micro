import { Injectable, signal } from '@angular/core';
import { ScanBarcode } from './hangtag.model';

@Injectable()
export class HangtagStore {
  barcode = signal<ScanBarcode.Response | null>(null);
}
