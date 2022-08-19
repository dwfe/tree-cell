import {recognizePropType} from '@do-while-for-each/common';
import {IAnnotation, ICellInit} from './contract';
import {ObsValueCell} from '../cell/ObsValueCell';
import {AsyncCell} from '../cell/AsyncCell';
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


export function checkPossibilityOfUsing(
  obj: any,
  prop: string | symbol,
  descriptor: PropertyDescriptor,
  annotation: IAnnotation,
): void {
  const propType = recognizePropType(descriptor);
  const info = [`See property '${String(prop)}' for object:`, obj];

  if (propType === 'accessor' || propType === 'setter') {
    const message = `It's forbidden to annotate properties that have a setter.`;
    console.error(message, ...info);
    throw new Error(message);
  }
  //
  // below are only: method | value | getter
  //
  if (annotation === 'asyncCell' && propType === 'getter') {
    console.error(`The 'asyncCell' annotation cannot be set for a getter.`, ...info);
    throw new Error(`Incorrect use of annotation 'asyncCell'`);
  }
  if (annotation === 'obsValueCell' && propType !== 'value') {
    console.error(`The 'obsValueCell' annotation can only be set on a value-based-property.`, ...info);
    throw new Error(`Incorrect use of annotation 'obsValueCell'`);
  }
}
