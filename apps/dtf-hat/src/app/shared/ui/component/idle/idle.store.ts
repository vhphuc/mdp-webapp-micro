import { Injectable, NgZone } from '@angular/core';
import { ComponentStore, OnStoreInit } from '@ngrx/component-store';
import { AuthStore } from 'src/app/auth/auth.store';
import {
  EMPTY,
  fromEvent,
  iif,
  map,
  merge,
  Observable,
  pipe,
  startWith,
  Subject,
  Subscriber,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

const afkTime = 7200; // 15 minutes
const visibleTime = 3600; // 5 minutes

export interface IdleState {
  countdown: number;
}

const initialState: IdleState = {
  countdown: afkTime,
};

@Injectable()
export class IdleStore extends ComponentStore<IdleState> implements OnStoreInit {
  $countdown = this.selectSignal(s => {
    const countdown = s.countdown;
    const seconds = countdown % 60;
    const minutes = (countdown - seconds) / 60;
    return minutes + ':' + seconds.toString().padStart(2, '0');
  });
  $isCountdownVisible = this.selectSignal(
    this.selectSignal(s => s.countdown),
    toSignal(this._authStore.isSignedIn$),
    (countdown, iSi) => 0 < countdown && countdown < visibleTime && iSi
  );

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _ngZone: NgZone
  ) {
    super(initialState);
  }

  ngrxOnStoreInit() {
    this.#signOutAfterIdleTooLong();

    this._ngZone.runOutsideAngular(() => {
      this.#resetIdleCountdown();
    });
  }

  //region log out after idle
  readonly #reset$ = new Subject<void>();
  readonly #resetIdleCountdown = this.effect<never>(
    pipe(
      switchMap(() => this._authStore.isSignedIn$),
      switchMap(iSi =>
        iif(() => iSi, merge(fromEvent(window, 'click'), fromEvent(window, 'mousemove'), fromEvent(window, 'keydown')), EMPTY)
      ),
      throttleTime(1000),
      tap(() => {
        this._ngZone.run(() => this.#reset$.next());
      })
    )
  );
  readonly #signOutAfterIdleTooLong = this.effect<never>(
    pipe(
      switchMap(() => this._authStore.isSignedIn$),
      switchMap(iSi =>
        iif(
          () => iSi,
          this.#reset$.pipe(
            startWith(0),
            switchMap(() => {
              const intervalWorker = new Worker(new URL('./idle.worker', import.meta.url));
              let afkTime = 0;
              return new Observable((subscriber: Subscriber<number>) => {
                intervalWorker.postMessage('start-interval');
                intervalWorker.onmessage = ({ data }) => {
                  subscriber.next(++afkTime);
                };
                return () => {
                  intervalWorker.terminate();
                };
              });
            }),
            map(seconds => afkTime - seconds)
          ),
          EMPTY
        )
      ),
      tap(countdown => {
        this.setState({ countdown });
        if (countdown <= 0) {
          this._authStore.signOut();
        }
      })
    )
  );
  //endregion
}
