import {getPropDescriptor} from '@do-while-for-each/common';
import {Throw} from '@do-while-for-each/test';
import {instanceAccessor, instanceGetter, instanceMethod, instanceSetter, instanceValue, objAccessor, objGetter, objMethod, objSetter, objValue} from './util/fields-separate';
import {Cell, cell, getCachedCell, makeObservable} from '../../..';

describe('02_makeObservable_cell_init', () => {

  test('value', () => {
    checkValue(objValue());
    checkValue(instanceValue());
  });

  test('getter', () => {
    checkGetter(objGetter());
    checkGetter(instanceGetter());
  });

  test('method', () => {
    checkMethod(objMethod());
    checkMethod(instanceMethod());
  });

  test('accessor', () => {
    checkAccessor(objAccessor());
    checkAccessor(instanceAccessor());
  });

  test('setter', () => {
    checkSetter(objSetter());
    checkSetter(instanceSetter());
  });

});

function checkValue([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(obj[prop]);
  expect(oldDescr.get).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  makeObservable(obj, {
    [prop]: cell,
  });
  const descriptor = getPropDescriptor(obj, prop);
  expect(descriptor.value).eq(undefined);
  expect(typeof descriptor.get).eq('function');
  expect(typeof descriptor.set).eq('function');
  expect(descriptor.configurable).False();
  expect(getCachedCell(obj, prop)).toBeInstanceOf(Cell);
}

function checkGetter([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(undefined);
  expect(typeof oldDescr.get).eq('function');
  expect(oldDescr.set).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  makeObservable(obj, {
    [prop]: cell,
  });
  const descriptor = getPropDescriptor(obj, prop);
  expect(descriptor.value).eq(undefined);
  expect(typeof descriptor.get).eq('function');
  expect(descriptor.set).eq(undefined);
  expect(descriptor.configurable).False();
  expect(getCachedCell(obj, prop)).toBeInstanceOf(Cell);
}

function checkMethod([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(typeof oldDescr.value).eq('function');
  expect(getCachedCell(obj, prop)).eq(undefined);
  makeObservable(obj, {
    [prop]: cell,
  });
  const descriptor = getPropDescriptor(obj, prop);
  expect(typeof descriptor.value).eq('function');
  expect(descriptor.writable).False();
  expect(descriptor.configurable).False();
  expect(getCachedCell(obj, prop)).toBeInstanceOf(Cell);
}

export function checkAccessor([obj, prop]: any[], annotation: Function = cell) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(undefined);
  expect(typeof oldDescr.get).eq('function');
  expect(typeof oldDescr.set).eq('function');
  expect(getCachedCell(obj, prop)).eq(undefined);
  Throw(() => makeObservable(obj, {
    [prop]: annotation,
  }), `It's forbidden to annotate properties that have a setter.`);
  expect(getCachedCell(obj, prop)).eq(undefined);
}

export function checkSetter([obj, prop]: any[], annotation: Function = cell) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(undefined);
  expect(oldDescr.get).eq(undefined);
  expect(typeof oldDescr.set).eq('function');
  expect(getCachedCell(obj, prop)).eq(undefined);
  Throw(() => makeObservable(obj, {
    [prop]: annotation,
  }), `It's forbidden to annotate properties that have a setter.`);
  expect(getCachedCell(obj, prop)).eq(undefined);
}
