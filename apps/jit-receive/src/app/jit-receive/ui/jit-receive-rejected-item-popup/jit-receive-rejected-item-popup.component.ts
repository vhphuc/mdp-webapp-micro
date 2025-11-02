import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NZ_MODAL_DATA, NzModalModule } from 'ng-zorro-antd/modal';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { JitReceiveStoreService } from '../../jit-receive-store.service';

@Component({
  selector: 'app-jit-receive-rejected-item-popup',
  standalone: true,
  imports: [
    TranslateModule,
    ImageErrorUrlDirective,
    UpperCasePipe,
    NzModalModule,
    NzTypographyComponent,
  ],
  templateUrl: './jit-receive-rejected-item-popup.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitReceiveRejectedItemPopupComponent implements OnInit {
  nzData = inject(NZ_MODAL_DATA) as { initialIdx: number; store: JitReceiveStoreService };
  rejectedItemGroups = this.nzData.store.rejectedPackageUnitGroups;
  rejectedItemLength = computed(() => {
    return this.rejectedItemGroups().flatMap(g => g.packageUnits).length;
  });
  $currItem = computed(() => {
    return this.rejectedItemGroups().flatMap(g => g.packageUnits)[this.itemIndex()];
  });
  itemIndex = signal(0);

  ngOnInit() {
    this.itemIndex.set(this.nzData.initialIdx);
  }

  previousItem() {
    this.itemIndex.update(idx => (idx === 0 ? 0 : idx - 1));
  }

  nextItem() {
    this.itemIndex.update(idx => (idx === this.rejectedItemLength() - 1 ? idx : idx + 1));
  }
}
