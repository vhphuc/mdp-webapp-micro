import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-scan-board',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, NzGridModule, NzSpaceModule, NzButtonModule],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'tw:flex',
  },
  template: `
    <div
      class="tw:relative tw:border tw:border-solid tw:border-black tw:p-4 tw:flex-1 tw:flex tw:flex-col"
      [ngClass]="{ 'tw:my-3': !noMargin }">
      <div class="tw:absolute tw:h-6 tw:px-2 tw:left-4 -tw:top-3">
        <nz-space class="tw:h-full">
          <div
            *nzSpaceItem
            class="tw:border tw:h-full tw:px-2"
            [class]="color === 'white' ? 'tw:border tw:border-solid tw:border-black' : ''"
            [class.tw:bg-white]="color === 'white'"
            [class.tw:bg-yellow-300]="color === 'yellow'"
            [class.tw:bg-red-500]="color === 'red'"
            [class.tw:bg-green-500]="color === 'green'">
            <span class="tw:font-semibold">{{ label }}</span>
          </div>
          <div *nzSpaceItem class="tw:h-full">
            @if (isResetStatus) {
              <button nz-button nzType="primary" class="tw:h-full tw:flex tw:items-center" (click)="resetStatus.emit()">Reset</button>
            }
          </div>
        </nz-space>
      </div>

      <ng-content></ng-content>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanBoardComponent {
  @Input({ required: true }) color!: 'white' | 'yellow' | 'red' | 'green';
  @Input({ required: true }) label!: string;
  @Input() noMargin!: boolean;

  @Input({ transform: booleanAttribute }) isResetStatus = false;
  @Output() resetStatus = new EventEmitter<void>();
}
