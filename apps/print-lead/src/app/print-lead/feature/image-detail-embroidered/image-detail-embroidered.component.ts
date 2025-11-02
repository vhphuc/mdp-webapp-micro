import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { EmbroideredImageDetail } from '../../data-access/model/print-lead.model';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-image-detail-embroidered',
  standalone: true,
  templateUrl: './image-detail-embroidered.component.html',
  imports: [CommonModule, NzGridModule, NzModalModule, NzIconModule, NzButtonModule, TranslateModule],
  providers: [TranslatePipe],
})
export class ImageDetailEmbroideredComponent {
  @ViewChild('viewRecipeContentRef', { static: false }) viewRecipeContentRef!: TemplateRef<NzSafeAny>;
  @ViewChild('viewRecipeFootRef', { static: false }) viewRecipeFootRef!: TemplateRef<NzSafeAny>;

  @Input() data!: EmbroideredImageDetail.Response;

  private modalRef: NzModalRef<NzSafeAny> | null = null;

  constructor(
    private readonly _nzModalService: NzModalService,
    private readonly _translatePipe: TranslatePipe
  ) {}

  openViewRecipeModal() {
    this.modalRef = this._nzModalService.create({
      nzTitle: this._translatePipe.transform('ORDER.RECIPE'),
      nzContent: this.viewRecipeContentRef,
      nzFooter: this.viewRecipeFootRef,
      nzWidth: 600,
      nzMaskClosable: true,
      nzData: this.data?.item?.embroideryJobApiRequest ? JSON.parse(this.data.item.embroideryJobApiRequest) : '',
    });
  }

  onCloseViewRecipe() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
