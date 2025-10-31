import { AsyncPipe } from "@angular/common";
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { GlobalSpinnerComponent } from "@shared/ui/component/global-spinner/global-spinner.component";
import { IdleComponent } from "@shared/ui/component/idle/idle.component";
import { timer } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, GlobalSpinnerComponent, IdleComponent, AsyncPipe],
  template: `
    <router-outlet />
    <app-global-spinner />
    @if (loaded$ | async) {
      <app-idle />
    }
  `,
})
export class AppComponent {
  protected loaded$ = timer(10000).pipe(map(() => true));
}
