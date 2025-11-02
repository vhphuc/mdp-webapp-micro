import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalModule } from 'ng-zorro-antd/modal';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { JitReceiveStoreService } from '../../jit-receive-store.service';

@Component({
  selector: 'app-jit-receive-accepted-item-popup',
  standalone: true,
  imports: [ImageErrorUrlDirective, NzButtonModule, NzModalModule, NzTypographyModule, TranslateModule, UpperCasePipe],
  templateUrl: './jit-receive-accepted-item-popup.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitReceiveAcceptedItemPopupComponent implements OnInit {
  nzData = inject(NZ_MODAL_DATA) as { initialIdx: number; store: JitReceiveStoreService };
  $packageUnitGroups = this.nzData.store.packageUnitGroups;
  $itemLength = computed(() => {
    return this.$packageUnitGroups().flatMap(g => g.acceptedPackageUnits).length;
  });
  $currItem = computed(() => {
    return this.$packageUnitGroups().flatMap(g => g.acceptedPackageUnits)[this.$itemIndex()];
  });
  $itemIndex = signal(0);

  ngOnInit() {
    this.$itemIndex.set(this.nzData.initialIdx);
  }

  previousItem() {
    this.$itemIndex.update(idx => (idx === 0 ? 0 : idx - 1));
  }

  nextItem() {
    this.$itemIndex.update(idx => (idx === this.$itemLength() - 1 ? idx : idx + 1));
  }
}
