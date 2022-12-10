import {delayAsync} from '@do-while-for-each/common';
import {actualizeScheduledCells, autorun, Cell} from '../../..';
import {checkFields, lastValueChangeResult} from '../../util';

describe('00_some', () => {

  test('debounce changes', () => {
    const firstName = new Cell('Tom');
    const lastName = new Cell('Cat');
    const fullName = new Cell(() => firstName.get() + ' ' + lastName.get());
    const fullNameOnChange = jest.fn();

    fullName.onChange(fullNameOnChange);
    expect(fullNameOnChange).toBeCalledTimes(1);
    lastValueChangeResult(fullNameOnChange, undefined, 'Tom Cat');

    firstName.set('Jerry');
    lastName.set('Mouse');
    expect(fullNameOnChange).toBeCalledTimes(1);
    actualizeScheduledCells();
    expect(fullNameOnChange).toBeCalledTimes(2);

    expect(fullName.get()).eq('Jerry Mouse');
    actualizeScheduledCells();
    expect(fullNameOnChange).toBeCalledTimes(2);
    lastValueChangeResult(fullNameOnChange, 'Tom Cat', 'Jerry Mouse');
  });

  test('dispose -> #1 root cell has no dependencies', async () => {
    const a = new Cell(() => b.get());
    const b = new Cell(17);

    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [17, true, false, 0, 0, false, false, false]);

    const aOnChange = jest.fn();
    a.onChange(aOnChange);

    checkFields(a, [17, true, true, 1, 0, true, true, false]);
    checkFields(b, [17, true, true, 0, 1, false, false, false]);

    a.offChange(aOnChange);
    await delayAsync(50);
    checkFields(a, [17, false, false, 0, 0, false, false, false]);
    checkFields(b, [17, true, false, 0, 0, false, false, false]);
  });

  test('dispose -> #2 root cell has no dependencies', async () => {
    const a = new Cell(() => b.get());
    const b = new Cell(17);

    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [17, true, false, 0, 0, false, false, false]);

    const aOnChange = jest.fn();
    a.onChange(aOnChange);

    checkFields(a, [17, true, true, 1, 0, true, true, false]);
    checkFields(b, [17, true, true, 0, 1, false, false, false]);

    b.set(84); // schedule rootCell before dispose!!!

    a.offChange(aOnChange);
    await delayAsync(50);
    checkFields(a, [84, false, false, 0, 0, false, false, false]);
    checkFields(b, [84, true, false, 0, 0, false, false, false]);
  });

  test('изменение зависимости в дереве, которое сейчас находится в процессе актуализации. Не видит', () => {
    const a = new Cell(() => b.get());
    const b = new Cell(1);
    let runCount = 0;
    expect(b.value).eq(1);
    expect(a.value).eq(undefined);
    autorun(() => {
      runCount++;
      const res = a.get();
      b.set(res + 1); // a -> b, и здесь мы меняем b
    });

    /**
     * Сколько не актуализируй
     * ячейка "a" не увидит изменение ячейки "b", т.к. изменение произошло
     * в процессе актуализации root-ячейки того дерева, к которому принадлежат ячейки "a" и "b":
     *   root -> a -> b
     * Так сделано, чтобы избежать бесконечный цикл.
     */
    actualizeScheduledCells();
    expect(runCount).eq(1);
    expect(b.value).eq(2);
    expect(a.value).eq(1);
    actualizeScheduledCells();
    expect(runCount).eq(1);
    expect(b.value).eq(2);
    expect(a.value).eq(1); // где моя двойка??

    b.set(7);
    actualizeScheduledCells();
    expect(runCount).eq(2);
    expect(b.value).eq(8);
    expect(a.value).eq(7); // почему не 8?
    actualizeScheduledCells();
    expect(runCount).eq(2);
    expect(b.value).eq(8);
    expect(a.value).eq(7); // 8 не будет никогда?
  });

});
