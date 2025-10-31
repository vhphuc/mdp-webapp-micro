import { Pipe, PipeTransform } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

@Pipe({
  name: 'appPluck',
  standalone: true,
})
export class PluckPipe implements PipeTransform {
  transform(value: Array<NzSafeAny>, index: number, fieldName: string) {
    if (!value?.[index]) return '';
    return value[index][fieldName];
  }
}
