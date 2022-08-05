import {delayAsync} from '@do-while-for-each/common';
import '@do-while-for-each/test';
import {actualizeScheduledCells, autorun, cell, makeObservable} from '../../..';
import {instanceTomAndJerry, objTomAndJerry} from './util/tom-and-jerry';
import {checkFields} from '../../util'

describe('06_autorun', () => {

  test('Tom and Jerry, object', () => {
    checkTomAndJerry(objTomAndJerry());
  });

  test('Tom and Jerry, constructor', () => {
    checkTomAndJerry(instanceTomAndJerry());
  });

  test('error occurs at the subscription stage', () => {
    const obj = {
      full() {
        throw 123;
      }
    };
    makeObservable(obj, {
      full: cell,
    });
    const onChange = jest.fn();
    expect(onChange).toBeCalledTimes(0);
    autorun(() => obj.full(), {onChange});
    expect(onChange).toBeCalledTimes(1);
    expect(onChange.mock.lastCall[0].error.message).eq('123');
  });

  test('dispose -> #1 root cell has no dependencies', async () => {
    const obj = {
      name: 'Alex',
      getName() {
        return this.name;
      }
    };
    makeObservable(obj, {
      name: cell,
      getName: cell,
    });
    const dispose = autorun(() => {
      obj.getName();
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    dispose();
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

  test('dispose -> #2 root cell has no dependencies', async () => {
    const obj = {
      name: 'Alex',
      getName() {
        return this.name;
      }
    };
    makeObservable(obj, {
      name: cell,
      getName: cell,
    });
    const dispose = autorun(() => {
      obj.getName();
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.name = 'Naruto'; // schedule rootCell before dispose!!!
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    dispose();
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

});

function checkTomAndJerry(target) {
  let result;
  const dispose = autorun(() => {
    result = target.fullName();
  });
  expect(result).eq('Tom Cat');

  target.name = 'Jerry';
  target.kind = 'Mouse';
  expect(result).eq('Tom Cat');
  actualizeScheduledCells();
  expect(result).eq('Jerry Mouse');

  dispose();
  target.name = 'Hello';
  target.kind = 'World';
  expect(result).eq('Jerry Mouse');
  actualizeScheduledCells();
  expect(result).eq('Jerry Mouse');
}
