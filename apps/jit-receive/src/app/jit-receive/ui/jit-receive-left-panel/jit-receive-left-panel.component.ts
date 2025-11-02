import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  PurchaseOrderType,
  PurchaseOrderTypeDescription,
} from '@shared/data-access/model/api/enum/purchase-order-type';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { JitReceiveStoreService } from '../../jit-receive-store.service';
import { JitReceiveAcceptedItemPopupComponent } from '../jit-receive-accepted-item-popup/jit-receive-accepted-item-popup.component';
import { JitReceiveRejectedItemPopupComponent } from '../jit-receive-rejected-item-popup/jit-receive-rejected-item-popup.component';

@Component({
  selector: 'app-jit-receive-left-panel',
  standalone: true,
  imports: [
    DatePipe,
    NzIconDirective,
    NzGridModule,
    TranslateModule,
    ImageErrorUrlDirective,
    NzModalModule,
  ],
  templateUrl: './jit-receive-left-panel.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitReceiveLeftPanelComponent {
  tracking = this._store.tracking;
  rejectedPackageUnitGroups = this._store.rejectedPackageUnitGroups;
  packageUnitGroups = this._store.packageUnitGroups;

  constructor(
    private readonly _store: JitReceiveStoreService,
    private readonly _nzModalSvc: NzModalService
  ) {}

  openAcceptedItemPopup(styleColorSizeCoo: string, acceptedCount: number) {
    if (!acceptedCount) return;
    if (this.packageUnitGroups().every(g => !g.acceptedPackageUnits.length)) return;
    const initialIdx = this.packageUnitGroups()
      .flatMap(g => g.acceptedPackageUnits)
      .findIndex(ri => ri.styleColorSizeCoo === styleColorSizeCoo);
    this._nzModalSvc.create({
      nzContent: JitReceiveAcceptedItemPopupComponent,
      nzFooter: null,
      nzWidth: 900,
      nzData: { initialIdx: initialIdx !== -1 ? initialIdx : 0, store: this._store },
    });
  }

  openRejectedItemPopup(styleColorSizeCoo: string) {
    const initialIdx = this.rejectedPackageUnitGroups()
      .flatMap(g => g.packageUnits)
      .findIndex(ri => ri.styleColorSizeCoo === styleColorSizeCoo);
    this._nzModalSvc.create({
      nzContent: JitReceiveRejectedItemPopupComponent,
      nzFooter: null,
      nzWidth: 900,
      nzData: { initialIdx, store: this._store },
    });
  }

  protected readonly PurchaseOrderTypeDescription = PurchaseOrderTypeDescription;
  protected readonly PurchaseOrderType = PurchaseOrderType;
}
