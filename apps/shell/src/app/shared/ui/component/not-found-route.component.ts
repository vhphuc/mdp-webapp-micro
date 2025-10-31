import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-route',
  standalone: true,
  imports: [CommonModule],
  template: ``,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundRouteComponent implements OnInit {
  constructor(private _router: Router) {}
  ngOnInit() {
    window.location.href = '/all-apps';
  }
}
