import {checkPossibilityOfUsing} from './checkPossibilityOfUsing';
import {ObsValueCell} from '../cell/ObsValueCell';
import {AsyncCell} from '../cell/AsyncCell';
import {ICellInit} from './contract';
import {Cell} from '../cell/Cell';
import {ICell} from '../contract';

const CELL_CACHE_PROP = Symbol('CELL_CACHE_PROP');

export function getCachedCell<T = ICell>(obj: any, prop: string | symbol): undefined | T {
  const cache = obj[CELL_CACHE_PROP];
  if (cache)
    return cache[prop];
}

export function getAllCachedCells(obj: any): undefined | Record<string | symbol, ICell> {
  const cache = obj[CELL_CACHE_PROP];
  if (cache)
    return {...cache};
}

export function registerCell(
  obj: any,
  prop: string | symbol,
  descriptor: PropertyDescriptor,
  {annotation, cellOpt}: ICellInit,
): {
  cell: ICell;
  fromCache?: boolean;
} {
  let cache = obj[CELL_CACHE_PROP];
  if (cache && cache[prop])
    return {
      cell: cache[prop],
      fromCache: true,
    };

  checkPossibilityOfUsing(obj, prop, descriptor, annotation);

  if (!cache) {
    cache = Object.create(null);
    Object.defineProperty(obj, CELL_CACHE_PROP, {
      value: cache,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
  let val = descriptor.get
    ? descriptor.get    // getter
    : descriptor.value; // method | value
  if (typeof val === 'function') {
    val = val.bind(obj);
  }
  let cell: ICell;
  switch (annotation) {
    case 'asyncCell':
      cell = new AsyncCell(val, cellOpt);
      break;
    case 'obsValueCell':
      cell = new ObsValueCell(val, cellOpt);
      break;
    default:
      cell = new Cell(val, cellOpt);
  }
  cache[prop] = cell;
  return {cell};
}

