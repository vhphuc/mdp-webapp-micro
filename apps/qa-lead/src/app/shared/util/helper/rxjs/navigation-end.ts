import {
  ActivationEnd,
  ActivationStart,
  ChildActivationEnd,
  ChildActivationStart,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RoutesRecognized,
  Scroll,
} from '@angular/router';
import { filter, OperatorFunction, pipe } from 'rxjs';

type Event =
  | NavigationStart
  | NavigationEnd
  | NavigationCancel
  | NavigationError
  | RoutesRecognized
  | GuardsCheckStart
  | GuardsCheckEnd
  | RouteConfigLoadStart
  | RouteConfigLoadEnd
  | ChildActivationStart
  | ChildActivationEnd
  | ActivationStart
  | ActivationEnd
  | Scroll
  | ResolveStart
  | ResolveEnd
  | NavigationSkipped;

export function navigationEnd(): OperatorFunction<Event, NavigationEnd> {
  return pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd));
}
