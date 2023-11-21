import {delayAsync} from '@do-while-for-each/common';
import {cell, makeObservable, once} from '../../../wrap';
import {checkFields} from '../../util';

describe('08_once', () => {

  test('dispose -> #1 сразу dispose, cell => value', async () => {
    const obj = new A();
    const actionFn = jest.fn();
    const dispose = once(() => obj.isReady, {
      filter: value => Boolean(value),
      action: actionFn,
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [false, true, true, 1, 0, true, true, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    dispose(); // сразу отписался
    await delayAsync(10);
    checkFields(rootCell, [false, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [false, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = false;
    await delayAsync(10);
    checkFields(rootCell, [false, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [false, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);
  });

  test('dispose -> #2 сразу dispose, cell => undefined', async () => {
    const obj = new A();
    const actionFn = jest.fn();
    const dispose = once(() => {
      obj.isReady;
    }, {
      filter: value => Boolean(value),
      action: actionFn,
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    dispose();
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = false;
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);
  });

  test('result -> #3 dispose при срабатывании filter', async () => {
    const obj = new A();
    const actionFn = jest.fn();
    const dispose = once(() => obj.isReady, {
      filter: value => Boolean(value),
      action: actionFn,
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [false, true, true, 1, 0, true, true, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);

    obj.isReady = false;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);
  });

  test('result -> #2 условие сработало при первом запуске', async () => {
    const obj = new A();
    obj.isReady = true;
    const actionFn = jest.fn();
    const dispose = once(() => obj.isReady, {
      filter: value => Boolean(value),
      action: actionFn,
    });
    const {rootCell} = dispose;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);

    obj.isReady = false;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);
  });

  test('skipInitResult', async () => {
    const obj = new A();
    obj.isReady = true;
    const actionFn = jest.fn();
    const dispose = once(() => obj.isReady, {
      skipInitResult: true,
      filter: value => Boolean(value),
      action: actionFn,
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [true, true, true, 1, 0, true, true, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = false;
    await delayAsync(10);
    checkFields(rootCell, [false, true, true, 1, 0, true, true, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(0);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);

    obj.isReady = false;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
    await delayAsync(10);
    expect(actionFn).toBeCalledTimes(1);
  });

});

//region Support

class A {
  isReady = false;

  constructor() {
    makeObservable(this, {
      isReady: cell,
    })
  }
}

//endregion Support
