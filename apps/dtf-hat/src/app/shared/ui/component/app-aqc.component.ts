import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, Input, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { ImageErrorUrlDirective } from '../directive/image-error-url.directive';
import { ImageZoomDirective } from '../directive/image-zoom.directive';
import { NzImageModule } from 'ng-zorro-antd/image';
import { FitRemainHeightDirective } from '../directive/fit-remaining-height.directive';
import { QaScanItemApi } from '../../../+qa/feature/qa-flow/data-access/qa-api';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';

@Component({
  selector: 'app-aqc',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzSpaceModule,
    ImageZoomDirective,
    ImageErrorUrlDirective,
    NzImageModule,
    TranslateModule,
    FitRemainHeightDirective,
    ImgPreviewDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aqc-wrapper" [appFitRemainingHeight]="fitViewPort">
      <div class="tw:border tw:border-solid tw:border-black tw:p-4 tw:flex-1 tw:flex tw:h-full tw:gap-x-2">
        <div class="text-information">
          <h4 class="tw:bg-gray-300 tw:text-xl tw:text-center tw:font-semibold tw:pl-2 tw:pr-2 tw:pt-1 tw:pb-1 tw:mb-1">
            {{ 'QA.PRINTIFY_AQC' | translate }}
          </h4>
          <div class="tw:text-[17px] tw:h-full" *ngFor="let item of $paging()">
            <div class="tw:flex tw:gap-x-1">
              <span class="tw:font-semibold label tw:text-right">{{ 'QA.RESULT' | translate }}: </span>
              <span
                class=" tw:font-semibold tw:w-[60%] tw:pl-1"
                [ngClass]="{
                    'tw:bg-red-500 tw:text-white': !item.result,
                    'tw:bg-green-500 tw:text-white': item.result,
                  }">
                {{ (item.result ? 'QA.SUCCESS' : 'QA.FAIL') | translate }}
              </span>
            </div>
            <div class="tw:flex tw:gap-x-1">
              <span class="tw:font-semibold label tw:text-right">{{ 'QA.TIME' | translate }}: </span>
              <span>{{ item.time }}</span>
            </div>
            <div class="tw:flex tw:gap-x-1 tw:bg-gray-200" *ngIf="item.issues.length">
              <span class="label"></span>
              <span class="tw:font-semibold tw:text-xl">{{ 'QA.ISSUE' | translate }}</span>
            </div>
            <div class="issue-container tw:slim-scrollbar">
              <div *ngFor="let issue of item.issues" [ngClass]="{ 'issue-border': item.issues.length > 1 }">
                <div class="tw:flex tw:gap-x-1">
                  <span class="tw:font-semibold label tw:text-right">{{ 'QA.TYPE' | translate }}:</span>
                  <span class="tw:text-red-500 tw:font-semibold">{{ issue.typeDescription }}</span>
                </div>
                <div class="tw:flex tw:gap-x-1">
                  <span class="tw:font-semibold label tw:text-right">{{ 'QA.EXPECTED' | translate }}:</span>
                  <span>{{ issue.expected }}</span>
                </div>
                <div class="tw:flex tw:gap-x-1 ">
                  <span class="tw:font-semibold label tw:text-right">{{ 'QA.DETECTED' | translate }}:</span>
                  <span>{{ issue.detected }}</span>
                </div>
              </div>
            </div>
            <div class="tw:mt-[30px] tw:font-semibold">
              <div class="tw:text-center">AQC {{ $currentIndex() + 1 }} of {{ $data().length }}</div>
              <div class="tw:flex tw:justify-between tw:gap-x-2">
                <div>
                  <span (click)="previous()" class="prev tw:whitespace-nowrap tw:cursor-pointer" [hidden]="$disabledPrevious()"
                    >< {{ 'QA.PREVIOUS' | translate }}</span
                  >
                </div>
                <div>
                  <span (click)="next()" class="next tw:whitespace-nowrap tw:cursor-pointer" [hidden]="$disabledNext()"
                    >{{ 'QA.NEXT' | translate }} ></span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tw:flex-1 tw:flex tw:gap-1 tw:mt-2">
          <div class="tw:flex-1 tw:image-fill">
            <img
              [src]="$currentImageUrl()"
              class="tw:object-top tw:cursor-pointer"
              [appPreviewImage]="[$currentImageUrl()]"
              appImageErrorUrl
              alt="preview-img" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .issue-container {
        max-height: calc(100% - 230px);
        overflow-y: auto;
      }
      .text-information {
        width: 35%;
        min-width: 220px;
      }
      .label {
        min-width: 75px;
        width: 40%;
      }
      .issue-border {
        border-top: 1px solid black;
      }
      .aqc-wrapper {
        min-height: 600px;
      }
    `,
  ],
})
export class AppAqcComponent {
  @ViewChild(ImageZoomDirective) imageZoom!: ImageZoomDirective;

  @Input() fitViewPort = true;
  @Input() set qualityResults(value: Array<QaScanItemApi.QaQualityResult> | null) {
    if (value) {
      const lastIndexOfData = value.length - 1;
      this.$currentIndex.set(lastIndexOfData);
      this.$data.set(value);
    }
  }

  public readonly $data = signal<Array<QaScanItemApi.QaQualityResult>>([]);
  public readonly $currentIndex = signal(0);
  public readonly $currentImageUrl = computed(() => {
    const time = new Date().getTime();
    // ?v=time : to avoid azure blob cache
    return this.$paging()[0]?.imageUrl + '?v=' + time;
  });

  $paging = computed(() => {
    const start = this.$currentIndex();
    const end = start + 1;
    const result = this.$data().slice(start, end);
    return result;
  });

  $disabledPrevious = computed(() => {
    return this.$currentIndex() <= 0;
  });

  $disabledNext = computed(() => {
    return this.$currentIndex() >= this.$data().length - 1;
  });

  previous() {
    if (this.$currentIndex() > 0) {
      const previousIndex = this.$currentIndex() - 1;
      this.$currentIndex.set(previousIndex);
    }
  }

  next() {
    if (this.$currentIndex() < this.$data().length - 1) {
      const nextIndex = this.$currentIndex() + 1;
      this.$currentIndex.set(nextIndex);
    }
  }
}
