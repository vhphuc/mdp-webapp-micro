import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { DtfHatStoreService } from '../../dtf-hat-store.service';

@Component({
  selector: 'app-dtf-hat-preview-image',
  standalone: true,
  imports: [ImageErrorUrlDirective],
  templateUrl: './dtf-hat-preview-image.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtfHatPreviewImageComponent {
  store = inject(DtfHatStoreService);
  $item = this.store.$item;
}
