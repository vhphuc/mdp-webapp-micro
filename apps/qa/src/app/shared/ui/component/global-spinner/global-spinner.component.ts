import { ChangeDetectionStrategy, Component, inject, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalSpinnerStore } from './global-spinner.store';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSpinnerComponent implements OnInit {
  gsStore = inject(GlobalSpinnerStore);

  constructor(private readonly _viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    this.gsStore.renderSpinner(this._viewContainerRef);
  }
}
