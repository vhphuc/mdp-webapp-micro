import { Injectable, ViewContainerRef } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EMPTY, fromEvent, iif, pipe, switchMap, tap } from 'rxjs';
import { ThreeCircleSpinComponent } from './three-circle-spin.component';

export interface GlobalSpinnerState {
  loading: number;
}

const initialState: GlobalSpinnerState = {
  loading: 0,
};

@Injectable({ providedIn: 'root' })
export class GlobalSpinnerStore extends ComponentStore<GlobalSpinnerState> {
  constructor() {
    super(initialState);
    this.disableKeyboardIfLoading();
  }

  readonly disableKeyboardIfLoading = this.effect<never>(
    pipe(
      switchMap(() => this.select(s => s.loading)),
      switchMap(loading => iif(() => !!loading, fromEvent(window, 'keydown'), EMPTY)),
      tap(ev => ev.preventDefault())
    )
  );

  readonly renderSpinner = this.effect<ViewContainerRef>(
    pipe(
      switchMap(viewContainerRef =>
        this.select(s => s.loading).pipe(
          tap(loading => {
            if (loading > 0) {
              if (!viewContainerRef.length) {
                viewContainerRef.createComponent(ThreeCircleSpinComponent);
              }
            } else {
              viewContainerRef.clear();
            }
          })
        )
      )
    )
  );

  readonly start = this.updater(s => ({
    loading: s.loading + 1,
  }));
  readonly stop = this.updater(s => ({
    loading: s.loading - 1,
  }));
}
