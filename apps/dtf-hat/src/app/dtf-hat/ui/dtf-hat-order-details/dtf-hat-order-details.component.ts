import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DtfHatStoreService } from '../../dtf-hat-store.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-dtf-hat-order-details',
  standalone: true,
  imports: [
    TranslateModule,
    UpperCasePipe
  ],
  templateUrl: './dtf-hat-order-details.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtfHatOrderDetailsComponent {
  store = inject(DtfHatStoreService);
  $item = this.store.$item;
}
