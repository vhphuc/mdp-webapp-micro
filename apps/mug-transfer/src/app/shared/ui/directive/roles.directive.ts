// import { Directive, ElementRef, Input, OnInit } from '@angular/core';
// import { Role } from '@shared/data-access/model/api/enum/role';
//
// @Directive({
//   selector: '[appRoles]',
//   standalone: true,
// })
// export class RoleDirective implements OnInit {
//   @Input({ required: true }) public appRoles: Role[] = [];
//
//   constructor(private _elementRef: ElementRef, private _userStore: UserStore) {}
//
//   public ngOnInit() {
//     const havePermission = this._checkPermission();
//     this._handleElement(havePermission);
//   }
//
//   private _checkPermission(): boolean {
//     const $userRoles = this._userStore.selectSignal(s => s.user?.roles);
//     if (!$userRoles()) return false;
//
//     return $userRoles()!.includes(Role.Administrator) || this.appRoles.some(role => $userRoles()!.includes(role));
//   }
//
//   private _handleElement(havePermission: boolean) {
//     const el: HTMLElement = this._elementRef.nativeElement;
//     if (!havePermission) {
//       el.parentNode!.removeChild(el);
//     }
//   }
// }
