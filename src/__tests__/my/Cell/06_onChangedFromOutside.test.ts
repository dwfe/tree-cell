import {noop} from '@do-while-for-each/test';
import {Cell} from '../../..';

describe('06_onChangedFromOutside', () => {

  test('data', done => {
    checkOnOutside(7, 10, 7, done);
    noChange(7, 7);
  });

  test('lazy constant', done => {
    checkOnOutside(() => 7, 10, undefined, done);
    noChange(() => 7, undefined);
  });


  test('data, subscribed', done => {
    checkOnOutsideSubscribed(7, 10, 7, done);
    noChangeSubscribed(7, 7);
  });

  test('lazy constant, subscribed', done => {
    checkOnOutsideSubscribed(() => 7, 10, 7, done);
    noChangeSubscribed(() => 7, 7);
  });

});

function checkOnOutside(val: any, value, oldValue, done) {
  const a = new Cell(val, {
    onChangedFromOutside: change => {
      expect(change.oldValue).eq(oldValue);
      expect(change.value).eq(value);
      done();
    }
  });
  a.set(value);
}

function checkOnOutsideSubscribed(val: any, value, oldValue, done) {
  const a = new Cell(val, {
    onChangedFromOutside: change => {
      expect(change.oldValue).eq(oldValue);
      expect(change.value).eq(value);
      done();
    }
  });
  a.onChange(noop);
  a.set(value);
}

function noChange(val: any, value) {
  const onChangedFromOutsideHandler = jest.fn();
  const a = new Cell(val, {onChangedFromOutside: onChangedFromOutsideHandler});
  a.set(value);
  expect(a.value).eq(value);
  expect(onChangedFromOutsideHandler).toBeCalledTimes(0);
}

function noChangeSubscribed(val: any, value) {
  const onChangedFromOutsideHandler = jest.fn();
  const a = new Cell(val, {onChangedFromOutside: onChangedFromOutsideHandler});
  a.onChange(noop);
  a.set(value);
  expect(a.value).eq(value);
  expect(onChangedFromOutsideHandler).toBeCalledTimes(0);
}
