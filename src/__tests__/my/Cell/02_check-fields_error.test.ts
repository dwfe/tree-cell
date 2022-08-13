import {Throw} from '@do-while-for-each/test';
import {actualizeScheduledCells, Cell} from '../../..';
import {checkFields} from '../../util';

/**
 * После fail execution все ячейки дерева state ACTUAL
 * https://github.com/Riim/cellx/issues/46
 */

describe('02_check-fields_error', () => {

  test('error occurred as a result of the dependency', () => {
    const a = new Cell(() => b.get());
    const b = new Cell(() => {
      const some = w.get();
      if (s.get() > 5)
        throw new Error('some err');
      return some + c.get();
    });
    const c = new Cell(8);
    const s = new Cell(3);
    const w = new Cell(() => 12);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(c, [8, true, false, 0, 0, false, false, false]);
    checkFields(s, [3, true, false, 0, 0, false, false, false]);
    checkFields(w, [undefined, false, false, 0, 0, false, false, false]);
    const aOnChange = jest.fn();
    const aOnValue = jest.fn();
    const aOnError = jest.fn();

    a.onChange(aOnChange);
    checkFields(a, [20, true, true, 1, 0, true, true, false]);
    checkFields(b, [20, true, true, 3, 1, true, true, false]);
    checkFields(c, [8, true, true, 0, 1, false, false, false]);
    checkFields(s, [3, true, true, 0, 1, false, false, false]);
    checkFields(w, [12, true, true, 0, 1, false, false, false]);
    expect(aOnChange).toBeCalledTimes(1);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(0);

    a.onValue(aOnValue);
    checkFields(a, [20, true, true, 1, 0, true, true, false]);
    checkFields(b, [20, true, true, 3, 1, true, true, false]);
    checkFields(c, [8, true, true, 0, 1, false, false, false]);
    checkFields(s, [3, true, true, 0, 1, false, false, false]);
    checkFields(w, [12, true, true, 0, 1, false, false, false]);
    expect(aOnChange).toBeCalledTimes(1);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(0);

    a.onError(aOnError);
    checkFields(a, [20, true, true, 1, 0, true, true, false]);
    checkFields(b, [20, true, true, 3, 1, true, true, false]);
    checkFields(c, [8, true, true, 0, 1, false, false, false]);
    checkFields(s, [3, true, true, 0, 1, false, false, false]);
    checkFields(w, [12, true, true, 0, 1, false, false, false]);
    expect(aOnChange).toBeCalledTimes(1);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(0);

    // перевожу в состояние ошибки
    s.set(7);
    actualizeScheduledCells();
    checkFields(a, [20, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [20, true, true, 2, 1, true, true, 'some err']);
    checkFields(c, [8, true, false, 0, 0, false, false, false]);
    checkFields(s, [7, true, true, 0, 1, false, false, false]);
    checkFields(w, [12, true, true, 0, 1, false, false, false]);
    Throw(() => a.get(), 'some err');
    Throw(() => b.get(), 'some err');
    expect(aOnChange).toBeCalledTimes(2);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(1);

    // дерево остается в состоянии ошибки после изменения зависимости
    s.set(6);
    actualizeScheduledCells();
    checkFields(a, [20, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [20, true, true, 2, 1, true, true, 'some err']);
    checkFields(c, [8, true, false, 0, 0, false, false, false]);
    checkFields(s, [6, true, true, 0, 1, false, false, false]);
    checkFields(w, [12, true, true, 0, 1, false, false, false]);
    Throw(() => a.get(), 'some err');
    Throw(() => b.get(), 'some err');
    expect(aOnChange).toBeCalledTimes(3);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(2);

    // вывожу из состояния ошибки, когда значение совпадает с прошлым значением
    s.set(1);
    actualizeScheduledCells();
    checkFields(a, [20, true, true, 1, 0, true, true, false]);
    checkFields(b, [20, true, true, 3, 1, true, true, false]);
    checkFields(c, [8, true, true, 0, 1, false, false, false]);
    checkFields(s, [1, true, true, 0, 1, false, false, false]);
    checkFields(w, [12, true, true, 0, 1, false, false, false]);
    expect(aOnChange).toBeCalledTimes(3);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(2);
    expect(a.get()).eq(20);

    // перевожу в состояние ошибки
    s.set(10);
    actualizeScheduledCells();
    checkFields(a, [20, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [20, true, true, 2, 1, true, true, 'some err']);
    checkFields(c, [8, true, false, 0, 0, false, false, false]);
    checkFields(s, [10, true, true, 0, 1, false, false, false]);
    checkFields(w, [12, true, true, 0, 1, false, false, false]);
    Throw(() => a.get(), 'some err');
    Throw(() => b.get(), 'some err');
    expect(aOnChange).toBeCalledTimes(4);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(3);

    // дерево остается в состоянии ошибки после изменения зависимости
    // эта зависимость влияет на будущее значние ячейки b
    w.set(9);
    actualizeScheduledCells();
    checkFields(a, [20, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [20, true, true, 2, 1, true, true, 'some err']);
    checkFields(c, [8, true, false, 0, 0, false, false, false]);
    checkFields(s, [10, true, true, 0, 1, false, false, false]);
    checkFields(w, [9, true, true, 0, 1, false, false, false]);
    Throw(() => a.get(), 'some err');
    Throw(() => b.get(), 'some err');
    expect(aOnChange).toBeCalledTimes(5);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(4);

    // вывожу из состояния ошибки
    s.set(-5);
    actualizeScheduledCells();
    checkFields(a, [17, true, true, 1, 0, true, true, false]);
    checkFields(b, [17, true, true, 3, 1, true, true, false]);
    checkFields(c, [8, true, true, 0, 1, false, false, false]);
    checkFields(s, [-5, true, true, 0, 1, false, false, false]);
    checkFields(w, [9, true, true, 0, 1, false, false, false]);
    expect(aOnChange).toBeCalledTimes(6);
    expect(aOnValue).toBeCalledTimes(1);
    expect(aOnError).toBeCalledTimes(4);
    expect(a.get()).eq(17);
  });

  test('error occurred as a result of the dependency - start from the end', () => {
    const a = new Cell(() => b.get());
    const b = new Cell(() => {
      const some = w.get();
      if (s.get() > 5)
        throw new Error('some err');
      return some + c.get();
    });
    const c = new Cell(7);
    const s = new Cell(3);
    const w = new Cell(() => 15);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(c, [7, true, false, 0, 0, false, false, false]);
    checkFields(s, [3, true, false, 0, 0, false, false, false]);
    checkFields(w, [undefined, false, false, 0, 0, false, false, false]);
    const aOnChange = jest.fn();
    const aOnValue = jest.fn();
    const aOnError = jest.fn();
    const bOnError = jest.fn();
    const cOnError = jest.fn();
    const sOnError = jest.fn();
    const wOnError = jest.fn();

    w.onError(wOnError);
    checkFields(w, [15, true, true, 0, 0, false, false, false]);
    s.onError(sOnError);
    checkFields(s, [3, true, true, 0, 0, false, false, false]);
    c.onError(cOnError);
    checkFields(c, [7, true, true, 0, 0, false, false, false]);
    b.onError(bOnError);
    checkFields(b, [22, true, true, 3, 0, true, true, false]);
    a.onError(aOnError);
    checkFields(a, [22, true, true, 1, 0, true, true, false]);
    a.onChange(aOnChange);
    a.onValue(aOnValue);

    expect(aOnChange).toBeCalledTimes(0);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(0);
    expect(bOnError).toBeCalledTimes(0);
    expect(cOnError).toBeCalledTimes(0);
    expect(sOnError).toBeCalledTimes(0);
    expect(wOnError).toBeCalledTimes(0);
    checkFields(a, [22, true, true, 1, 0, true, true, false]);
    checkFields(b, [22, true, true, 3, 1, true, true, false]);
    checkFields(c, [7, true, true, 0, 1, false, false, false]);
    checkFields(s, [3, true, true, 0, 1, false, false, false]);
    checkFields(w, [15, true, true, 0, 1, false, false, false]);

    //спровоцировать ошибку
    s.set(9);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(1);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(1);
    expect(bOnError).toBeCalledTimes(1);
    expect(cOnError).toBeCalledTimes(0);
    expect(sOnError).toBeCalledTimes(0);
    expect(wOnError).toBeCalledTimes(0);
    checkFields(a, [22, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [22, true, true, 2, 1, true, true, 'some err']);
    checkFields(c, [7, true, true, 0, 0, false, false, false]);
    checkFields(s, [9, true, true, 0, 1, false, false, false]);
    checkFields(w, [15, true, true, 0, 1, false, false, false]);

    // выключить лишних слушателей
    w.offError(wOnError);
    s.offError(sOnError);
    c.offError(cOnError);
    b.offError(bOnError);
    expect(aOnChange).toBeCalledTimes(1);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(1);
    expect(bOnError).toBeCalledTimes(1);
    expect(cOnError).toBeCalledTimes(0);
    expect(sOnError).toBeCalledTimes(0);
    expect(wOnError).toBeCalledTimes(0);
    checkFields(a, [22, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [22, true, true, 2, 1, true, true, 'some err']);
    checkFields(c, [7, true, false, 0, 0, false, false, false]);
    checkFields(s, [9, true, true, 0, 1, false, false, false]);
    checkFields(w, [15, true, true, 0, 1, false, false, false]);

    // вернуть в состояние без ошибки
    s.set(4);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(1);
    expect(aOnValue).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(1);
    expect(bOnError).toBeCalledTimes(1);
    expect(cOnError).toBeCalledTimes(0);
    expect(sOnError).toBeCalledTimes(0);
    expect(wOnError).toBeCalledTimes(0);
    checkFields(a, [22, true, true, 1, 0, true, true, false]);
    checkFields(b, [22, true, true, 3, 1, true, true, false]);
    checkFields(c, [7, true, true, 0, 1, false, false, false]);
    checkFields(s, [4, true, true, 0, 1, false, false, false]);
    checkFields(w, [15, true, true, 0, 1, false, false, false]);
  });

  test('error is not related to dependencies - start from the end', () => {
    const a = new Cell(() => b.get());
    const b = new Cell(() => {
      const some = w.get();
      if (true)
        throw new Error('some err');
      //@ts-ignore
      return some + c.get();
    });
    const c = new Cell(7);
    const w = new Cell(() => 15);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(c, [7, true, false, 0, 0, false, false, false]);
    checkFields(w, [undefined, false, false, 0, 0, false, false, false]);
    const aOnChange = jest.fn();
    const aOnError = jest.fn();
    const bOnError = jest.fn();
    const cOnError = jest.fn();
    const wOnError = jest.fn();

    w.onError(wOnError);
    checkFields(w, [15, true, true, 0, 0, false, false, false]);
    c.onError(cOnError);
    checkFields(c, [7, true, true, 0, 0, false, false, false]);
    b.onError(bOnError);
    checkFields(b, [undefined, true, true, 1, 0, true, true, 'some err']);
    a.onError(aOnError);
    checkFields(a, [undefined, true, true, 1, 0, true, true, 'some err']);
    a.onChange(aOnChange);

    expect(aOnChange).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(1);
    expect(bOnError).toBeCalledTimes(1);
    expect(cOnError).toBeCalledTimes(0);
    expect(wOnError).toBeCalledTimes(0);
    checkFields(a, [undefined, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [undefined, true, true, 1, 1, true, true, 'some err']);
    checkFields(c, [7, true, true, 0, 0, false, false, false]);
    checkFields(w, [15, true, true, 0, 1, false, false, false]);

    w.offError(wOnError);
    c.offError(cOnError);
    b.offError(bOnError);
    expect(aOnChange).toBeCalledTimes(0);
    expect(aOnError).toBeCalledTimes(1);
    expect(bOnError).toBeCalledTimes(1);
    expect(cOnError).toBeCalledTimes(0);
    expect(wOnError).toBeCalledTimes(0);
    checkFields(a, [undefined, true, true, 1, 0, true, true, 'some err']);
    checkFields(b, [undefined, true, true, 1, 1, true, true, 'some err']);
    checkFields(c, [7, true, false, 0, 0, false, false, false]);
    checkFields(w, [15, true, true, 0, 1, false, false, false]);
  });

});


// const truthy = new Cell(false);
// const a = new Cell(() => b.get());
// const b = new Cell(() => {
//   const prefix = truthy.get() ? 'truthy' : r.get();
//   if (!truthy.get())
//     throw new Error('not truthy');
//   return prefix + c.get();
// });
// const c = new Cell(() => d.get());
// const d = new Cell(7);
// const r = new Cell(() => s.get());
// const s = new Cell('hello');
//
// const onChangeHandler = data => {
//   console.log('onChange', data);
// };
//
// a.onChange(onChangeHandler);
// truthy.set(true);
// actualizeScheduledCells();

