import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { JitReceiveStoreService } from '../../jit-receive-store.service';
import { JitReceiveStep } from '../../jit-receive.model';

@Component({
  selector: 'app-jit-receive-bread-crumb',
  standalone: true,
  imports: [NzBreadCrumbComponent, NzBreadCrumbItemComponent, TranslateModule, UpperCasePipe],
  templateUrl: './jit-receive-bread-crumb.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitReceiveBreadCrumbComponent {
  step = this._store.step;
  constructor(private readonly _store: JitReceiveStoreService) {}

  resetScanProcess() {
    this._store.reset();
  }
  protected readonly JitReceiveStep = JitReceiveStep;
}
