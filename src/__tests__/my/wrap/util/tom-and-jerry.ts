// @formatter:off
import {Cell, cell, getCachedCell, makeObservable} from '../../../..';

function getObj(): ITomAndJerry {
  return {
    name: 'Tom',
    kind: 'Cat',
    fullName() {
      return this.name + ' ' + this.kind;
    },
    get fullNameReversed() {
      return Array.from(this.fullName()).reverse().join('');
    }
  };
}

class TomAndJerry {
  name = 'Tom';
  kind = 'Cat';
  constructor() {
    makeObservable(this, {
      name: cell,
      kind: cell,
      fullName: cell,
    });
  }
  fullName() {
    return this.name + ' ' + this.kind;
  }
  get fullNameReversed() {
    return Array.from(this.fullName()).reverse().join('');
  }
}

export function objTomAndJerry(): ITomAndJerry {
  const obj = getObj();
  makeObservable(obj, {
    name: cell,
    kind: cell,
    fullName: cell,
  });
  expect(getCachedCell<Cell>(obj, 'name')).toBeInstanceOf(Cell);
  expect(getCachedCell<Cell>(obj, 'kind')).toBeInstanceOf(Cell);
  expect(getCachedCell<Cell>(obj, 'fullName')).toBeInstanceOf(Cell);
  return obj;
}

export function instanceTomAndJerry(): ITomAndJerry {
  const obj = new TomAndJerry();
  expect(getCachedCell<Cell>(obj, 'name')).toBeInstanceOf(Cell);
  expect(getCachedCell<Cell>(obj, 'kind')).toBeInstanceOf(Cell);
  expect(getCachedCell<Cell>(obj, 'fullName')).toBeInstanceOf(Cell);
  return obj;
}


interface ITomAndJerry {
  name: string;
  kind: string;
  fullName(): string;
  fullNameReversed: string;
}
