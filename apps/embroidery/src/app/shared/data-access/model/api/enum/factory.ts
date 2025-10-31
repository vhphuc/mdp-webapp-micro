export enum Factory {
  Miami = 1,
  Juarez = 2,
  Tijuana = 3,
}

export class FactoryMap {
  static values = [Factory.Miami, Factory.Juarez, Factory.Tijuana];

  static readonly indexes = new Map<Factory, number>([
    [Factory.Miami, FactoryMap.values.findIndex(v => v === Factory.Miami)],
    [Factory.Juarez, FactoryMap.values.findIndex(v => v === Factory.Juarez)],
    [Factory.Tijuana, FactoryMap.values.findIndex(v => v === Factory.Tijuana)],
  ]);

  static readonly names = new Map([
    [Factory.Miami, 'Miami'],
    [Factory.Juarez, 'Juarez'],
    [Factory.Tijuana, 'Tijuana'],
  ]);

  static readonly routes = new Map([
    [Factory.Miami, 'miami'],
    [Factory.Juarez, 'juarez'],
    [Factory.Tijuana, 'tijuana'],
  ]);

  static readonly routeValues = new Map([
    [FactoryMap.routes.get(Factory.Miami)!, Factory.Miami],
    [FactoryMap.routes.get(Factory.Juarez)!, Factory.Juarez],
    [FactoryMap.routes.get(Factory.Tijuana)!, Factory.Tijuana],
  ]);
}
