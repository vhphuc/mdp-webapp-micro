import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { ForceLogoutResponseEvent } from './signal-r.type';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  connection: signalR.HubConnection | null = null;
  connected$ = new BehaviorSubject<string | null | undefined>(null);

  constructor(
    private readonly _lsStore: LocalStorageStore,
    private readonly _router: Router
  ) {}

  // call on log in
  start(token: string) {
    // create connection hub
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(environment.REALTIME_DOMAIN, {
        accessTokenFactory: () => token,
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();
    // set timeout
    this.connection.serverTimeoutInMilliseconds = 300000;
    // start connection
    try {
      this.connection.start().then(() => {
        this.startListen();
        this.connected$.next(this.connection?.connectionId);
      });
      console.log('signalR connected');
    } catch (e) {
      console.error(e);
      setTimeout(() => void this.connection!.start(), 5000);
    }
  }

  // call on log out
  close() {
    if (this.connection) {
      void this.connection.stop();
    }
  }

  send(methodName: string, ...args: NzSafeAny[]) {
    this.connection!.invoke(methodName, ...args).catch(e => {
      console.log(e);
    });
  }

  startListen() {
    this.forceLogoutAppEvent();
  }

  private forceLogoutAppEvent() {
    this.connection!.on('force-logout-app', (data: ForceLogoutResponseEvent) => {
      // handle force logout event
      const currentUserId = this._lsStore.getUser()?.id;
      if (currentUserId === data.userId) {
        // send http request to logout
        this._lsStore.removeNonPersistKey();
        void this._router.navigate([this._router.url, 'authentication']);
      }
    });
  }
}
