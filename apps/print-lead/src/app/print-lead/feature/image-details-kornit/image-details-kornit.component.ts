import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { PrintItemImageDetailApi } from '../../data-access/model/print-lead.model';

@Component({
  selector: 'app-image-details-kornit',
  standalone: true,
  templateUrl: './image-details-kornit.component.html',
  imports: [CommonModule, NzGridModule, TranslateModule],
  styles: [
    `
      .category {
        word-break: break-all !important;
      }
    `,
  ],
})
export class ImageDetailsKornitComponent {
  @Input() data!: PrintItemImageDetailApi.ImageDetailKornit;
}
