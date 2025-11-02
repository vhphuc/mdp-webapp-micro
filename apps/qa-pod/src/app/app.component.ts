import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { GlobalSpinnerComponent } from "@shared/ui/component/global-spinner/global-spinner.component";
import { IdleComponent } from "@shared/ui/component/idle/idle.component";
import { UpdateCheckService } from "@shared/lib/update-check/update-check.service";
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
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  protected loaded$ = timer(10000).pipe(map(() => true));

  constructor(private readonly _updateCheckService: UpdateCheckService) {}

  ngOnInit(): void {
    // Unregister any existing service workers
    this.unregisterServiceWorkers();
    
    // Start checking for updates periodically (every 5 minutes)
    this._updateCheckService.startPeriodicCheck(300000);
  }

  private unregisterServiceWorkers(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration
            .unregister()
            .then((success) => {
              if (success) {
                console.log('Service worker unregistered successfully');
              }
            })
            .catch((error) => {
              console.error('Error unregistering service worker:', error);
            });
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Stop checking when component is destroyed
    this._updateCheckService.stopPeriodicCheck();
  }
}
