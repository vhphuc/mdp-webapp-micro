import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { DtfHatStore } from '../../dtf-hat.store';
import { DtfHatStep } from '../../dtf-hat.model';

@Component({
  selector: 'app-dtf-hat-bread-crumb',
  standalone: true,
  imports: [NzBreadCrumbComponent, NzBreadCrumbItemComponent, TranslateModule, UpperCasePipe],
  templateUrl: './dtf-hat-bread-crumb.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtfHatBreadCrumbComponent {
  store = inject(DtfHatStore);
  $item = this.store.$item;
  $step = this.store.$step;

  resetScanProcess() {
    this.store.reset();
  }

  protected readonly DtfHatStep = DtfHatStep;
}
