import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PrintItemImageDetailApi } from '../../data-access/model/print-lead.model';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'app-image-details-apollo',
  standalone: true,
  templateUrl: './image-details-apollo.component.html',
  imports: [CommonModule, NzGridModule, NzModalModule, NzIconModule, NzButtonModule, TranslateModule],
  providers: [TranslatePipe],
})
export class ImageDetailsApolloComponent {
  @ViewChild('viewRecipeContentRef', { static: false }) viewRecipeContentRef!: TemplateRef<NzSafeAny>;
  @ViewChild('viewRecipeFootRef', { static: false }) viewRecipeFootRef!: TemplateRef<NzSafeAny>;

  @Input() data!: PrintItemImageDetailApi.ImageDetailApollo;

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
      nzData: this.data?.recipe ? JSON.parse(this.data.recipe) : '',
    });
  }

  onCloseViewRecipe() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
