import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName], [formControl])[appDisabledControl]',
  standalone: true,
})
export class DisabledControlDirective {
  @Input() set appDisabledControl(state: boolean) {
    const action = state ? 'disable' : 'enable';
    if (this.ngControl.control) {
      this.ngControl.control[action]();
    }
  }
  constructor(private readonly ngControl: NgControl) {}
}
