import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DtfHatStore } from '../../dtf-hat.store';
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
  store = inject(DtfHatStore);
  $item = this.store.$item;
}
