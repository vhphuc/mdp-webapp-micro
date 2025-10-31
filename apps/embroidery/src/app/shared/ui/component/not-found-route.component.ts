import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found-route',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundRouteComponent implements OnInit {
  ngOnInit() {
    window.location.href = '/all-apps';
  }
}
