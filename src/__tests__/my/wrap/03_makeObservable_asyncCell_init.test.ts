import {getPropDescriptor} from '@do-while-for-each/common';
import {Throw} from '@do-while-for-each/test';
import {instanceAccessor, instanceGetter, instanceSetter, instanceValue as instanceValueSync, objAccessor, objGetter, objSetter, objValue as objValueSync} from './util/fields-separate';
import {instanceMethod, instanceValue, objMethod, objValue} from './util/fields-separate.async';
import {checkAccessor, checkSetter} from './02_makeObservable_cell_init.test';
import {AsyncCell, asyncCell, getCachedCell, makeObservable} from '../../..';

describe('03_makeObservable_asyncCell_init', () => {

  test('value', () => {
    checkValue(objValue());
    checkValue(instanceValue());
  });

  test('value, error', () => {
    checkValueError(objValueSync());
    checkValueError(instanceValueSync());
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
    checkAccessor(objAccessor(), asyncCell);
    checkAccessor(instanceAccessor(), asyncCell);
  });

  test('setter', () => {
    checkSetter(objSetter(), asyncCell);
    checkSetter(instanceSetter(), asyncCell);
  });

});

function checkValue([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(obj[prop]);
  expect(oldDescr.get).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  makeObservable(obj, {
    [prop]: asyncCell,
  });
  const descriptor = getPropDescriptor(obj, prop);
  expect(descriptor.value).eq(undefined);
  expect(typeof descriptor.get).eq('function');
  expect(descriptor.set).eq(undefined); // no setter!!!
  expect(descriptor.configurable).False();
  expect(getCachedCell(obj, prop)).toBeInstanceOf(AsyncCell);
}

function checkValueError([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(obj[prop]);
  expect(oldDescr.get).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  Throw(() => makeObservable(obj, {
    [prop]: asyncCell,
  }), 'AsyncCell.sourceCell cannot process value');
  expect(getCachedCell(obj, prop)).eq(undefined);
}

function checkGetter([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(undefined);
  expect(typeof oldDescr.get).eq('function');
  expect(oldDescr.set).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  Throw(() => makeObservable(obj, {
    [prop]: asyncCell,
  }), `Incorrect use of annotation 'asyncCell'`);
  expect(getCachedCell(obj, prop)).eq(undefined);
}

function checkMethod([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(typeof oldDescr.value).eq('function');
  expect(getCachedCell(obj, prop)).eq(undefined);
  makeObservable(obj, {
    [prop]: asyncCell,
  });
  const descriptor = getPropDescriptor(obj, prop);
  expect(typeof descriptor.value).eq('function');
  expect(descriptor.writable).False();
  expect(descriptor.configurable).False();
  expect(getCachedCell(obj, prop)).toBeInstanceOf(AsyncCell);
}
