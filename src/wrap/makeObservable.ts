import {getPropDescriptor} from '@do-while-for-each/common';
import {processAnnotation} from './annotation';
import {ICellInit} from './contract';
import {registerCell} from './cache';
import {ICell} from '../contract';

export function makeObservable(obj: object, data: Record<string | symbol, Function | ICellInit>): void {
  for (const prop of Object.keys(data)) {
    const descriptor = getPropDescriptor(obj, prop);
    const init = processAnnotation(data, prop);
    const {cell, fromCache} = registerCell(obj, prop, descriptor, init);
    if (fromCache) {
      continue;
    }
    if (typeof descriptor.value === 'function')
      setMethod(obj, prop, descriptor, cell);                 // method         => method
    else
      setAccessorHandlers(obj, prop, descriptor, init, cell); // getter | value => getter | accessor
  }
}


function setMethod(obj: any, prop: any, descriptor: PropertyDescriptor, cell: ICell): void {
  Object.defineProperty(obj, prop, {
    value: method(cell),
    writable: false,
    configurable: false,
    enumerable: descriptor.enumerable,
  });
}

function method(cell: ICell) {
  return function () {
    // if (args.length) then these arguments will not affect the state of the cell.
    // Instead, transfer the arguments of the function to its body and then change the state of these dependencies.
    return cell.get();
  }
}


function setAccessorHandlers(obj: any, prop: any, descriptor: PropertyDescriptor, init: ICellInit, cell: ICell): void {
  const onlyGetter = (
    !cell.isDataCell || // if the original property is a getter
    init.annotation === 'asyncCell'
  );
  Object.defineProperty(obj, prop, {
    ...accessorHandlers(cell, onlyGetter),
    configurable: false,
    enumerable: descriptor.enumerable,
  });
}

function accessorHandlers(cell: ICell, onlyGetter: boolean) {
  const handlers: Pick<PropertyDescriptor, 'get' | 'set'> = {
    get() {
      return cell.get();
    },
  };
  if (!onlyGetter)
    handlers.set = function (value: any) {
      cell.set(value);
    };
  return handlers;
}
