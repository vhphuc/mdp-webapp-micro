import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { PrintItemImageDetailApi } from '../../data-access/model/print-lead.model';

@Component({
  selector: 'app-image-details-mug',
  standalone: true,
  templateUrl: './image-details-mug.component.html',
  imports: [CommonModule, NzGridModule, NzModalModule, NzIconModule, NzButtonModule, TranslateModule],
})
export class ImageDetailsMugComponent {
  @ViewChild('viewRecipeContentRef', { static: false }) viewRecipeContentRef!: TemplateRef<NzSafeAny>;
  @ViewChild('viewRecipeFootRef', { static: false }) viewRecipeFootRef!: TemplateRef<NzSafeAny>;
  @Input() data!: PrintItemImageDetailApi.MugInfoModel;
}
