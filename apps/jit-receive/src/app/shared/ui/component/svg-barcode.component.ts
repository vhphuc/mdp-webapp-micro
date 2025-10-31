import { AfterViewInit, booleanAttribute, ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-svg-barcode',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tw:flex tw:justify-center" [ngClass]="{ 'tw:border tw:border-solid tw:border-gray-400': border }">
      <svg id="container-{{ barcode }}"></svg>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgBarcodeComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) barcode!: string;
  @Input({ transform: booleanAttribute }) border = true;

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['barcode'].isFirstChange()) {
      // setTimeout to wait for element to get new id before render barcode
      setTimeout(() => this.renderBarcode());
    }
  }

  ngAfterViewInit() {
    this.renderBarcode();
  }

  renderBarcode() {
    JsBarcode(`#container-${this.barcode}`, this.barcode, {
      displayValue: false,
      height: 80,
    });
  }
}
