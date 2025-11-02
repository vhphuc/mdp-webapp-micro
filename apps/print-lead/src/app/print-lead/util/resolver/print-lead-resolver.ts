import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonApiService } from '@shared/data-access/api/common-api.service';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';

export const PrintLeadResolver: ResolveFn<UserFactoriesGetApi.Response> = (route: ActivatedRouteSnapshot) => {
  return inject(CommonApiService)
    .userFactoriesGet()
    .pipe(
      map(resp => resp.data ?? []),
      catchError(() => of([]))
    );
};
