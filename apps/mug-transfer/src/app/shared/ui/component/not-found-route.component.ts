import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';

@Component({
  selector: 'app-not-found-route',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundRouteComponent implements OnInit {
  constructor(private _router: Router, private _lsStore: LocalStorageStore) {}
  ngOnInit() {
    this._lsStore.removeCurrApp();
    void this._router.navigate(['/all-apps']);
  }
}
