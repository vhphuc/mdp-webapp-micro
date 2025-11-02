import { inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { map, Observable, pipe, switchMap, tap, throttleTime } from 'rxjs';
import { Router, UrlTree } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Role } from '@shared/data-access/model/api/enum/role';
import { AuthService } from './auth.service';

export interface AuthState {}

@Injectable({ providedIn: 'root' })
export class AuthStore extends ComponentStore<AuthState> {
  isSignedIn$ = this._lsStorage.token$.pipe(map(token => !!token));

  constructor(
    private readonly _lsStorage: LocalStorageStore,
    private readonly _router: Router,
    private readonly _nzModalSvc: NzModalService,
    private readonly _authService: AuthService
  ) {
    super();
  }

  isNotSignedInGuard(): Observable<boolean | UrlTree> {
    return this.isSignedIn$.pipe(
      map(isSignedIn => {
        if (!isSignedIn) return true;
        return this._router.createUrlTree(['/']);
      })
    );
  }

  isSignedInGuard(): Observable<boolean | UrlTree> {
    return this.isSignedIn$.pipe(
      map(isSignedIn => {
        if (isSignedIn) return true;

        return this._router.createUrlTree(['/authentication']);
      })
    );
  }

  roleGuard(roles: Role[]): Observable<boolean | UrlTree> {
    const lsStore = inject(LocalStorageStore);
    const user$ = lsStore.select(s => s.user);
    return user$.pipe(
      map(user => {
        if (!user) return true;
        if (!user.roles.includes(Role.Administrator) && user.roles.every(uRole => !roles.includes(uRole))) {
          window.location.href = '/all-apps';
          return false;
        }

        return true;
      })
    );
  }

  signIn(accessToken: string) {
    this._lsStorage.setToken(accessToken);
    void this._router.navigate(['/']);
  }

  readonly signOut = this.effect<never>(
    pipe(
      throttleTime(1000),
      switchMap(() => {
        return this._authService.logout().pipe(
          tap({
            next: () => {
              this._lsStorage.removeNonPersistKey();
              this._nzModalSvc.closeAll();
              void this._router.navigate(['/authentication']);
            }
          })
        );
      })
    )
  );

  readonly signOutWithoutCallApi = this.effect<never>(
    pipe(
      throttleTime(1000),
      tap(() => {
        this._lsStorage.removeNonPersistKey();
        this._nzModalSvc.closeAll();
        void this._router.navigate(['/authentication']);
      })
    )
  );

  readonly signOutToAllApps = this.effect<never>(
    pipe(
      throttleTime(1000),
      tap(() => {
        this._lsStorage.removeNonPersistKey();
        this._nzModalSvc.closeAll();
        window.location.href = '/all-apps';
      })
    )
  );
}
