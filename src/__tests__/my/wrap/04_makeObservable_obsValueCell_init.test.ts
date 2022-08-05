import {getPropDescriptor} from '@do-while-for-each/common';
import {Throw} from '@do-while-for-each/test';
import {instanceAccessor, instanceGetter, instanceMethod, instanceSetter, instanceValue as instanceValueSync, objAccessor, objGetter, objMethod, objSetter, objValue as objValueSync} from './util/fields-separate';
import {getCachedCell, makeObservable, obsValueCell, ObsValueCell} from '../../..';
import {checkAccessor, checkSetter} from './02_makeObservable_cell_init.test';
import {instanceValue, objValue} from './util/fields-separate.obsValue';

describe('04_makeObservable_obsValueCell_init', () => {

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
    checkAccessor(objAccessor(), obsValueCell);
    checkAccessor(instanceAccessor(), obsValueCell);
  });

  test('setter', () => {
    checkSetter(objSetter(), obsValueCell);
    checkSetter(instanceSetter(), obsValueCell);
  });

});


function checkValue([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(obj[prop]);
  expect(oldDescr.get).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  makeObservable(obj, {
    [prop]: obsValueCell,
  });
  const descriptor = getPropDescriptor(obj, prop);
  expect(descriptor.value).eq(undefined);
  expect(typeof descriptor.get).eq('function');
  expect(typeof descriptor.set).eq('function');
  expect(descriptor.configurable).False();
  expect(getCachedCell(obj, prop)).toBeInstanceOf(ObsValueCell);
}

function checkValueError([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(obj[prop]);
  expect(oldDescr.get).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  Throw(() => makeObservable(obj, {
    [prop]: obsValueCell,
  }), 'ObsValueCell can only be initiated by an ObsValueLike');
  expect(getCachedCell(obj, prop)).eq(undefined);
}

function checkGetter([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(oldDescr.value).eq(undefined);
  expect(typeof oldDescr.get).eq('function');
  expect(oldDescr.set).eq(undefined);
  expect(getCachedCell(obj, prop)).eq(undefined);
  Throw(() => makeObservable(obj, {
    [prop]: obsValueCell,
  }), `Incorrect use of annotation 'obsValueCell'`);
  expect(getCachedCell(obj, prop)).eq(undefined);
}

function checkMethod([obj, prop]: any[]) {
  const oldDescr = getPropDescriptor(obj, prop);
  expect(typeof oldDescr.value).eq('function');
  expect(getCachedCell(obj, prop)).eq(undefined);
  Throw(() => makeObservable(obj, {
    [prop]: obsValueCell,
  }), `Incorrect use of annotation 'obsValueCell'`);
  expect(getCachedCell(obj, prop)).eq(undefined);
}
