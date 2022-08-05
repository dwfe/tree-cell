import '@do-while-for-each/test';
import {actualizeScheduledCells, Cell, ICell} from '../../..';

describe('03_subscription', function () {

  test('onFirstSubscribed, data', () => {
    checkCalledTimesOnFirstSubscribe(0, new Cell(7));
  });

  test('onFirstSubscribed, lazy constant', () => {
    checkCalledTimesOnFirstSubscribe(1, new Cell(() => 5));
  });

  test('onFirstSubscribed, computed', () => {
    const b = new Cell(() => 43);
    checkCalledTimesOnFirstSubscribe(1, new Cell(() => b.get()));
  });


  test('on second, data', () => {
    const a = new Cell(7);
    checkCalledTimesSecondChange(1, a, () => a.set(5));
    expect(a.value).eq(5)
  });

  test('on second, lazy constant', () => {
    const a = new Cell(() => 7);
    checkCalledTimesSecondChange(2, a, () => a.set(5));
    expect(a.value).eq(5);
  });

  test('on second, computed', () => {
    const a = new Cell(() => b.get());
    const b = new Cell(() => 43);
    checkCalledTimesSecondChange(2, a, () => {
      b.set(5);
      actualizeScheduledCells();
    });
    expect(a.value).eq(5);
  });


  test('subscription first result, lazy constant', () => {
    onFirstResult(new Cell(() => 15), 15, undefined);
  });

  test('subscription first result, computed', () => {
    const b = new Cell(() => 42);
    onFirstResult(new Cell(() => b.get()), 42, undefined);
  });


  test('subscription second result, data', done => {
    onSecondResult(new Cell(4), 7, 4, done);
  });

  test('subscription second result, lazy constant', done => {
    onSecondResult(new Cell(() => 15), 'hi', 15, done);
  });

  test('subscription second result, lazy constant', done => {
    const b = new Cell(() => null);
    onSecondResult(new Cell(() => b.get()), true, null, done);
  });

});


function checkCalledTimesOnFirstSubscribe(firstCount: number, cell: ICell) {
  const onChangeHandler = jest.fn();
  cell.onChange(onChangeHandler);
  expect(onChangeHandler).toBeCalledTimes(firstCount);
}

function checkCalledTimesSecondChange(afterChangeCount: number, cell: ICell, changeFn: Function) {
  const onChangeHandler = jest.fn();
  cell.onChange(onChangeHandler);
  changeFn();
  expect(onChangeHandler).toBeCalledTimes(afterChangeCount);
}

function onFirstResult(cell: ICell, value, oldValue) {
  cell.onChange(data => {
    expect(data).toHaveProperty('oldValue', oldValue);
    expect(data).toHaveProperty('value', value);
  });
}

function onSecondResult(cell: ICell, value, oldValue, done) {
  cell.onValue(data => {
    if (data.oldValue === undefined) {
      return;
    }
    expect(data).toHaveProperty('oldValue', oldValue);
    expect(data).toHaveProperty('value', value);
    done();
  });
  cell.set(value);
}
