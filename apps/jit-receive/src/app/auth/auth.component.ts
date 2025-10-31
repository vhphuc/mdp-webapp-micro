import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonApiService } from '@shared/data-access/api/common-api.service';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { AuthStore } from 'src/app/auth/auth.store';
import { LocalStorageStore, UserKey } from '@shared/data-access/store/local-storage.store';
import { SignalRService } from '@shared/lib/signlr/signal-r.service';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { forkJoin } from 'rxjs';
import { appName } from '../app.const';
import { LoginApi } from './auth.model';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    KeepFocusDirective,
    NzInputModule,
    NzFormModule,
    ReactiveFormsModule,
    TranslateModule,
    NzSpinModule,
    NzModalModule,
  ],
  template: `
    <div class="tw:h-full tw:bg-gray-100">
      <div class="tw:bg-primary tw:py-5 tw:text-center">
        <img ngSrc="../../assets/icons/logo-white.png" alt="logo" height="58" width="90" />
        <h3 class="tw:text-lg tw:text-white tw:mt-4">Monster Digital Platform</h3>
      </div>
      <div class="tw:mt-3">
        <h1 class="tw:text-4xl tw:text-[#37bc9b] tw:text-center">{{ appName }}</h1>
        <input
          type="text"
          id="login-input"
          class="tw:opacity-0"
          appKeepFocus
          autocomplete="off"
          [formControl]="barcodeControl"
          (keyup.enter)="login()"
          (keydown.space)="$event.preventDefault()" />

        <div *ngIf="errorMsg()">
          <div class="tw:w-[550px] tw:mx-auto tw:border tw:border-solid tw:border-[#ebbebe] tw:rounded-md tw:overflow-hidden">
            <div
              class="tw:capitalize tw:text-sm tw:font-semibold tw:text-[#a94442] tw:bg-[#f2dede] tw:p-[10px] tw:border-0 tw:border-b tw:border-solid tw:border-[#ebbebe]">
              {{ 'AUTH.AUTH_CMP.INVALID_LOGIN' | translate }}
            </div>
            <div class="tw:bg-white tw:text-[#da4453] tw:py-[25px] tw:text-2xl tw:text-center">
              {{ errorMsg()!.errorKey | translate: errorMsg()!.paramError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  providers: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  barcodeControl = new FormControl('', { nonNullable: true });
  errorMsg = signal<LoginApi.LoginError | null>(null);

  protected readonly appName = appName;

  constructor(
    private readonly _authSvc: AuthService,
    private readonly _authStore: AuthStore,
    private readonly _modalService: NzModalService,
    private readonly _translatePipe: TranslatePipe,
    private readonly _signalRService: SignalRService,
    private readonly _commonApiSvc: CommonApiService,
    private readonly _lsStore: LocalStorageStore
  ) {}

  login() {
    const barcode = this.barcodeControl.getRawValue();
    if (!barcode) return;

    this.barcodeControl.reset();

    this._authSvc.login({ barcode }).subscribe({
      next: (resp: SuccessResult<LoginApi.Response>) => {
        if (resp.data) {
          if (resp.data.isLoggedInOtherApp) {
            // confirm logout all other apps
            this.logoutAllOtherApps(resp.data);
            return;
          }

          // signal r connect
          this._signalRService.start(resp.data.accessToken);
          // redirect
          this._authStore.signIn(resp.data.accessToken);
          this.getUserProfile(resp.data.smartBatchingConfiguration);
        }
      },
      error: (error: LoginApi.LoginError) => {
        this.errorMsg.set(error);
      },
    });
  }

  private getUserProfile(smartBatchingConfiguration: LoginApi.Response['smartBatchingConfiguration']) {
    forkJoin([this._commonApiSvc.profileGet(), this._commonApiSvc.userFactoriesGet()]).subscribe(([profileResp, userFactoriesResp]) => {
      if (profileResp.data && userFactoriesResp.data) {
        const user: UserKey = {
          fullName: `${profileResp.data.firstName} ${profileResp.data.lastName}`,
          roles: profileResp.data.roles,
          factories: userFactoriesResp.data,
          id: profileResp.data.id,
          appLogin: profileResp.data.appName,
          smartBatchingConfiguration,
        };
        this._lsStore.setUser(user);
      }
    });
  }

  private logoutAllOtherApps(resp: LoginApi.Response) {
    const modal = this._modalService.create({
      nzTitle: this._translatePipe.transform('MULTIPLE_APP_LOGIN_DETECTED'),
      nzContent: this._translatePipe.transform('SERVER_ERROR_USER_LOGGIN_MULTIPLE_APPS', { appName: resp.appName }),
      nzFooter: [
        {
          label: this._translatePipe.transform('LOGOUT_ALL_OTHER_APPS'),
          type: 'primary',
          onClick: () => {
            if (resp.accessToken) {
              this._authSvc.logoutAllApps(resp.accessToken).subscribe(() => {
                this.login();
                modal.destroy();
              });
            }
          },
        },
        {
          label: this._translatePipe.transform('CANCEL'),
          onClick: () => {
            modal.destroy();
          },
        },
      ],
    });
  }
}
