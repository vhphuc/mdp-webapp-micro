import { Injectable, signal } from '@angular/core';
import { ScanItem } from './embroidery.model';

@Injectable()
export class EmbroideryStore {
  step = signal<'scan-item' | 'confirm-item'>('scan-item');
  item = signal<ScanItem.Response | null>(null);
  scanMsg = signal<{ key: string; params?: { [k: string]: string | number }; color: 'green' | 'red' } | null>(null);

  constructor() {}
}
