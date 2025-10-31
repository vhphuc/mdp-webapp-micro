import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AvailableLanguage, TranslateStore } from '@shared/data-access/store/translate.store';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-language',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, NzDropDownModule, NzMenuModule],
  template: `
    <div nz-dropdown [nzDropdownMenu]="langMenu" class="tw:cursor-pointer">
      <img
        ngSrc="../../../../assets/i18n/flags/usa.png"
        alt="American Flag"
        *ngIf="$currLang() === AvailableLanguage.ENGLISH"
        height="48"
        width="48" />
      <img
        ngSrc="../../../../assets/i18n/flags/spain.png"
        alt="Spain Flag"
        *ngIf="$currLang() === AvailableLanguage.SPANISH"
        height="48"
        width="48" />
    </div>
    <nz-dropdown-menu #langMenu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item (click)="translateStore.useLang(AvailableLanguage.ENGLISH)">
          <div class="tw:flex tw:items-center tw:gap-3">
            <img ngSrc="../../../../assets/i18n/flags/usa.png" alt="American Flag" height="48" width="48" />
          </div>
        </li>
        <li nz-menu-item (click)="translateStore.useLang(AvailableLanguage.SPANISH)">
          <div class="tw:flex tw:items-center tw:gap-3">
            <img ngSrc="../../../../assets/i18n/flags/spain.png" alt="American Flag" height="48" width="48" />
          </div>
        </li>
      </ul>
    </nz-dropdown-menu>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLanguageComponent {
  translateStore = inject(TranslateStore);
  $currLang = this.translateStore.selectSignal(s => s.currentLang);

  protected readonly AvailableLanguage = AvailableLanguage;
}
