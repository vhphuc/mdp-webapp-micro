import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from 'src/app/auth/auth.store';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-widget',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzDropDownModule, NzIconModule, NzMenuModule, TranslateModule, RouterLink],
  template: `
    <a nz-button nzType="text" nz-dropdown nzTrigger="click" [nzDropdownMenu]="menu" class="tw-text-white tw-font-semibold">
      {{ $user()?.fullName }}
      <span nz-icon nzType="caret-down"></span>
    </a>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item (click)="toAllApps()">All Apps</li>
      </ul>
      <ul nz-menu>
        <li nz-menu-item (click)="logOut()">{{ 'LOG_OUT' | translate }}</li>
      </ul>
    </nz-dropdown-menu>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserWidgetComponent {
  $user = inject(LocalStorageStore).selectSignal(s => s.user);

  constructor(private _authStore: AuthStore) {}

  logOut() {
    this._authStore.signOut();
  }

  toAllApps() {
    this._authStore.signOutToAllApps();
  }
}
