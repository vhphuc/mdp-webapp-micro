import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { SvgBarcodeComponent } from '@shared/ui/component/svg-barcode.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { TrimStore } from '../data-access/store/trim.store';
import { TrimScanAction } from '../data-access/model/enum/trim-scan-action';
import { TrimType } from '../data-access/model/enum/trim-type';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-trim-confirm-picked-trims',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ImgPreviewDirective,
    SvgBarcodeComponent,
    ReactiveFormsModule,
    KeepFocusDirective,
    NzTypographyModule,
  ],
  host: {
    class: 'tw-h-full tw-flex tw-flex-col',
  },
  template: `
    <div class="tw-flex tw-justify-center">
      <span class="tw-font-semibold tw-text-3xl">{{ 'TRIM.CONFIRM_PICKED_TRIMS' | translate | uppercase }}</span>
    </div>
    <div class="tw-text-center tw-h-8 tw-my-2">
      <span nz-typography nzType="danger" class="tw-text-2xl tw-font-bold" *ngIf="$controlErr() as err">{{
        err.errorKey | translate : err.paramError
      }}</span>
    </div>
    <div class="tw-flex-1 tw-flex tw-flex-col tw-gap-y-6 tw-overflow-y-auto ">
      <div class="tw-flex-1 tw-flex tw-flex-col" *ngFor="let trim of $trims(); let i = index">
        <div
          class="tw-flex tw-justify-center"
          [ngClass]="{
            'tw-bg-gray-200': trim.verifiedBarcode === null,
            'tw-bg-green-500': trim.verifiedBarcode?.action === TrimScanAction.Accept,
            'tw-bg-red-500 tw-text-white': trim.verifiedBarcode?.action === TrimScanAction.Reject
          }">
          <span class="tw-font-semibold tw-text-2xl">
            <span>{{ trim.trimType === TrimType.Hangtag ? 'HANGTAG ' + (i + 1) : 'STICKER' }} - </span>
            <span>{{ trim.trimName }}</span>
          </span>
        </div>
        <div class="tw-flex-1 tw-flex">
          <div class="tw-flex-1 tw-flex tw-flex-col">
            <span class="tw-font-semibold tw-text-xl tw-text-center tw-pb-3">{{ 'TRIM.NOT_AVAILABLE' | translate | uppercase }}</span>
            <app-svg-barcode [barcode]="trim.rejectBarcode.barcode" [border]="false" />
          </div>
          <div class="tw-flex-1 tw-flex tw-flex-col">
            <span class="tw-font-semibold tw-text-xl tw-text-center tw-pb-3 tw-border tw-border-solid tw-border-black">{{
              trim.binName
            }}</span>
            <div class="tw-flex-1 tw-image-fill">
              <img [src]="trim.fileUrl" appPreviewImage class="tw-object-top" />
            </div>
          </div>
          <div class="tw-flex-1 tw-flex tw-flex-col">
            <span class="tw-font-semibold tw-text-xl tw-text-center tw-pb-3">{{ 'TRIM.ACCEPT' | translate | uppercase }}</span>
            <app-svg-barcode [barcode]="trim.acceptBarcode.barcode" [border]="false" />
          </div>
        </div>
      </div>
    </div>
    <input type="text" class="tw-opacity-0" [formControl]="scanControl" appKeepFocus (keyup.enter)="scanCode()" />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimConfirmPickedTrimsComponent {
  trimStore = inject(TrimStore);
  $trims = this.trimStore.selectSignal(s => s.item!.trims);

  scanControl = new FormControl('');
  $controlErr = this.trimStore.selectSignal(s => s.controlError);

  $scanUnRequiredTrimIndex = signal<number | null>(null);

  scanCode() {
    const scanCode = this.scanControl.getRawValue()?.toUpperCase().trim();
    this.scanControl.reset();
    if (!scanCode) return;
    this.trimStore.patchState({ controlError: null });

    const allScanCodes = this.$trims().flatMap(t => [t.acceptBarcode.barcode, t.rejectBarcode.barcode]);
    if (!allScanCodes.includes(scanCode)) {
      this.trimStore.patchState({
        controlError: {
          errorKey: 'SCAN_CODE_XXX_INVALID',
          paramError: { xxx: scanCode },
        },
      });
      return;
    }

    this.trimStore.patchState(s => {
      const trims = s.item!.trims;
      const trim = trims.find(tr => (tr.acceptBarcode.barcode === scanCode || tr.rejectBarcode.barcode === scanCode) && !tr.isScanned)!;

      if (trim.isRequired) {
        if (trim.acceptBarcode.barcode === scanCode) {
          trim.verifiedBarcode = trim.acceptBarcode;
          trim.isScanned = true;
        } else if (trim.rejectBarcode.barcode === scanCode) {
          trim.verifiedBarcode = trim.rejectBarcode;
          trim.isScanned = true;
        }
      } else {
        const scanUnRequiredTrimIndex = this.$scanUnRequiredTrimIndex();
        const unrequiredTrimIdx = trims.findIndex((tr, i) => {
          if (scanUnRequiredTrimIndex === null) {
            return (tr.acceptBarcode.barcode === scanCode || tr.rejectBarcode.barcode === scanCode) &&
                   !tr.isScanned;
          }
          return i > scanUnRequiredTrimIndex && 
                 (tr.acceptBarcode.barcode === scanCode || tr.rejectBarcode.barcode === scanCode) &&
                 !tr.isScanned;
        });
        
        if (unrequiredTrimIdx !== -1) {
          if (trims[unrequiredTrimIdx].acceptBarcode.barcode === scanCode) {
            trims[unrequiredTrimIdx].verifiedBarcode = trims[unrequiredTrimIdx].acceptBarcode;
            trims[unrequiredTrimIdx].isScanned = true;
          } else if (trims[unrequiredTrimIdx].rejectBarcode.barcode === scanCode) {
            trims[unrequiredTrimIdx].verifiedBarcode = trims[unrequiredTrimIdx].rejectBarcode;
            trims[unrequiredTrimIdx].isScanned = true;
          }
          this.$scanUnRequiredTrimIndex.set(unrequiredTrimIdx);
        } else {
          this.$scanUnRequiredTrimIndex.set(null);
          this.scanControl.patchValue(scanCode);
          this.scanCode();
        }
      }
      return { ...s };
    });

    const trims = this.$trims();
    const hasDoneVerifying = trims.every(t => t.verifiedBarcode !== null);
    if (!hasDoneVerifying) return;

    const isRequiredTrimNotAvailable = trims.some(t => t.isRequired && t.verifiedBarcode!.action === TrimScanAction.Reject);
    if (isRequiredTrimNotAvailable) {
      this.trimStore.confirm();
    }
  }

  protected readonly TrimScanAction = TrimScanAction;
  protected readonly TrimType = TrimType;
}
