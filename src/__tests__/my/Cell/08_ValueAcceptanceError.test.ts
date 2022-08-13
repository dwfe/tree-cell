import {Throw} from '@do-while-for-each/test';
import {checkFields, lastValueChangeResult} from '../../util';
import {actualizeScheduledCells, Cell} from '../../..';

describe('08_ValueAcceptanceError', () => {

  test('filtered dataCell', () => {
    const filteredCell = new Cell(10, {filter: x => x > 5});
    checkFields(filteredCell, [10, true, false, 0, 0, false, false, false]);

    const filteredCellOnChange = jest.fn();
    filteredCell.onChange(filteredCellOnChange);
    expect(filteredCellOnChange).toBeCalledTimes(0);
    checkFields(filteredCell, [10, true, true, 0, 0, false, false, false]);
    expect(filteredCell.get()).eq(10);

    filteredCell.set(10);
    expect(filteredCellOnChange).toBeCalledTimes(0);
    checkFields(filteredCell, [10, true, true, 0, 0, false, false, false]);
    expect(filteredCell.get()).eq(10);

    filteredCell.set(12);
    expect(filteredCellOnChange).toBeCalledTimes(1);
    lastValueChangeResult(filteredCellOnChange, 10, 12);
    checkFields(filteredCell, [12, true, true, 0, 0, false, false, false]);
    expect(filteredCell.get()).eq(12);

    // фильтр отверг значение
    filteredCell.set(5);
    expect(filteredCellOnChange).toBeCalledTimes(2);
    lastValueChangeResult(filteredCellOnChange, undefined, undefined, 'Cell did not accept value: 5');
    checkFields(filteredCell, [12, true, true, 0, 0, false, false, 'Cell did not accept value: 5']);
    Throw(() => filteredCell.get(), 'Cell did not accept value: 5');

    // теперь новое значение опять принимается
    filteredCell.set(6);
    expect(filteredCellOnChange).toBeCalledTimes(3);
    lastValueChangeResult(filteredCellOnChange, 12, 6);
    checkFields(filteredCell, [6, true, true, 0, 0, false, false, false]);
    expect(filteredCell.get()).eq(6);
  });

  test('rootCell -> filtered dataCell', () => {
    const a = new Cell(() => filteredCell.get());
    const filteredCell = new Cell(10, {filter: x => x > 5});
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(filteredCell, [10, true, false, 0, 0, false, false, false]);

    const aOnChange = jest.fn();
    a.onChange(aOnChange);
    expect(aOnChange).toBeCalledTimes(1);
    lastValueChangeResult(aOnChange, undefined, 10);
    checkFields(a, [10, true, true, 1, 0, true, true, false]);
    checkFields(filteredCell, [10, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(10);
    expect(filteredCell.get()).eq(10);

    filteredCell.set(10);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(1);
    checkFields(a, [10, true, true, 1, 0, true, true, false]);
    checkFields(filteredCell, [10, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(10);
    expect(filteredCell.get()).eq(10);

    filteredCell.set(12);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(2);
    lastValueChangeResult(aOnChange, 10, 12);
    checkFields(a, [12, true, true, 1, 0, true, true, false]);
    checkFields(filteredCell, [12, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(12);
    expect(filteredCell.get()).eq(12);

    // фильтр отверг значение
    filteredCell.set(4);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(3);
    lastValueChangeResult(aOnChange, undefined, undefined, 'Cell did not accept value: 4');
    checkFields(a, [12, true, true, 1, 0, true, true, 'Cell did not accept value: 4']);
    checkFields(filteredCell, [12, true, true, 0, 1, false, false, 'Cell did not accept value: 4']);
    Throw(() => a.get(), 'Cell did not accept value: 4');
    Throw(() => filteredCell.get(), 'Cell did not accept value: 4');

    // теперь новое значение опять принимается
    filteredCell.set(7);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(4);
    lastValueChangeResult(aOnChange, 12, 7);
    checkFields(a, [7, true, true, 1, 0, true, true, false]);
    checkFields(filteredCell, [7, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(7);
    expect(filteredCell.get()).eq(7);
  });

  test('filtered rootCell -> dataCell', () => {
    const a = new Cell(() => b.get() * 2, {filter: x => x < 5});
    const b = new Cell(1);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [1, true, false, 0, 0, false, false, false]);

    const aOnChange = jest.fn();
    a.onChange(aOnChange);
    expect(aOnChange).toBeCalledTimes(1);
    lastValueChangeResult(aOnChange, undefined, 2);
    checkFields(a, [2, true, true, 1, 0, true, true, false]);
    checkFields(b, [1, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(2);
    expect(b.get()).eq(1);

    b.set(1);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(1);
    checkFields(a, [2, true, true, 1, 0, true, true, false]);
    checkFields(b, [1, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(2);
    expect(b.get()).eq(1);

    b.set(2);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(2);
    lastValueChangeResult(aOnChange, 2, 4);
    checkFields(a, [4, true, true, 1, 0, true, true, false]);
    checkFields(b, [2, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(4);
    expect(b.get()).eq(2);

    // фильтр отверг значение
    b.set(3);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(3);
    lastValueChangeResult(aOnChange, undefined, undefined, 'Cell did not accept value: 6');
    checkFields(a, [4, true, true, 1, 0, true, true, 'Cell did not accept value: 6']);
    checkFields(b, [3, true, true, 0, 1, false, false, false]);
    Throw(() => a.get(), 'Cell did not accept value: 6');
    expect(b.get()).eq(3);

    // теперь новое значение опять принимается
    b.set(-3);
    actualizeScheduledCells();
    expect(aOnChange).toBeCalledTimes(4);
    lastValueChangeResult(aOnChange, 4, -6);
    checkFields(a, [-6, true, true, 1, 0, true, true, false]);
    checkFields(b, [-3, true, true, 0, 1, false, false, false]);
    expect(a.get()).eq(-6);
    expect(b.get()).eq(-3);
  });

});
