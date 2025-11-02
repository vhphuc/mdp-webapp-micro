import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { ScanTrackingV2 } from '../../jit-receive.model';

@Component({
  selector: 'app-jit-receive-item',
  standalone: true,
  imports: [ImageErrorUrlDirective, ImgPreviewDirective, TranslateModule, UpperCasePipe, NzTypographyComponent],
  templateUrl: './jit-receive-item.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitReceiveItemComponent {
  item = input.required<ScanTrackingV2.PackageUnitPreQrCode>();
}
