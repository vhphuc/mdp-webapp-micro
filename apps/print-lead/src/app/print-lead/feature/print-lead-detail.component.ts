import { Component, Input, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrintLeadStore } from '../data-access/store/print-lead.store';
import { DetailImage, EmbroideredImageDetail } from '../data-access/model/print-lead.model';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ImageDetailsApolloComponent } from './image-details-apollo/image-details-apollo.component';
import { ImageDetailsKornitComponent } from './image-details-kornit/image-details-kornit.component';
import { ImageDetailsPolarisComponent } from './image-details-polaris/image-details-polaris.component';
import { ImageDetailsStickerComponent } from './image-detail-sticker/image-details-sticker.component';
import { ImageDetailsMugComponent } from './image-detail-mug/image-details-mug.component';
import { ImageDetailsHatComponent } from './image-detail-hat/image-details-hat.component';
import { PrintLeadService } from '../data-access/api/print-lead.service';
import { ImageDetailEmbroideredComponent } from './image-detail-embroidered/image-detail-embroidered.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-print-lead-detail',
  standalone: true,
  imports: [
    TranslateModule,
    NzTabsModule,
    ImageDetailsKornitComponent,
    ImageDetailsPolarisComponent,
    ImageDetailsApolloComponent,
    ImageDetailsStickerComponent,
    ImageDetailsMugComponent,
    ImageDetailsHatComponent,
    ImageDetailEmbroideredComponent,
    NgIf,
  ],
  template: `
    <div class="image-details-wrapper">
      @if (imageDetail()) {
        @if (imageDetail()!.mugInfo) {
          <app-image-details-mug [data]="imageDetail()!.mugInfo" />
        } @else if (imageDetail()!.stickerInfo) {
          <app-image-details-sticker [data]="imageDetail()!.stickerInfo" />
        } @else if (imageDetail()!.hatInfo) {
          <app-image-details-hat [data]="imageDetail()!.hatInfo" />
        } @else {
          <nz-tabset [nzAnimated]="false">
            <nz-tab *ngIf="!imageDetail()?.isFanaticOrder && !imageDetail()?.isFocoOrder" [nzTitle]="'ORDER.ATLAS' | translate">
              <app-image-details-kornit [data]="imageDetail()!.kornitInfo"></app-image-details-kornit>
            </nz-tab>
            <nz-tab [nzTitle]="'ORDER.POLARIS' | translate">
              <app-image-details-polaris [data]="imageDetail()!.polarisInfo"></app-image-details-polaris>
            </nz-tab>
            <nz-tab *ngIf="!imageDetail()?.isFanaticOrder && !imageDetail()?.isFocoOrder" [nzTitle]="'ORDER.APOLLO' | translate">
              <app-image-details-apollo [data]="imageDetail()!.apolloInfo"></app-image-details-apollo>
            </nz-tab>
          </nz-tabset>
        }
      } @else if (embroideredImageDetail()) {
        <app-image-detail-embroidered [data]="embroideredImageDetail()!" />
      }
    </div>
  `,
  styles: [
    `
      ::ng-deep .ant-modal-body {
        padding-top: 0;
        padding-bottom: 0;
      }
    `,
  ],
})
export class PrintLeadDetailComponent implements OnInit {
  @Input() attrId!: number;
  @Input() orderDetailUnitId!: number;
  @Input() prStore!: PrintLeadStore;

  imageDetail = signal<DetailImage.Response | null>(null);
  embroideredImageDetail = signal<EmbroideredImageDetail.Response | null>(null);

  constructor(private readonly _apiSvc: PrintLeadService) {}

  ngOnInit(): void {
    const item = this.prStore.selectSignal(s => s.printLeadScanItem);
    if (item().isEmbroideredPrint) {
      this.getEmbroideredImageDetail();
    } else {
      this.getImageDetail();
    }
  }

  getImageDetail() {
    this._apiSvc.getDetailImage(this.attrId, this.prStore.state().stationName).subscribe({
      next: resp => {
        if (!resp.data) return;
        this.imageDetail.set(resp.data);
      },
    });
  }

  getEmbroideredImageDetail() {
    this._apiSvc.getDetailEmbroideredImage(this.attrId, this.orderDetailUnitId).subscribe({
      next: resp => {
        if (!resp.data) return;
        this.embroideredImageDetail.set(resp.data);
      },
    });
  }
}
