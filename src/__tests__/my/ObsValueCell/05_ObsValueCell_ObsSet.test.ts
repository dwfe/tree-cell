import {createObsSet} from '@do-while-for-each/common';
import {actualizeScheduledCells, Cell, ObsValueCell} from '../../..';
import {checkSupport} from './03_ObsValueCell_ObsArray.test';
import {checkFields} from '../../util';

describe('05_ObsValueCell_ObsSet', () => {

  test('value', () => {
    const set = createObsSet<any>();
    let callCount = 0;
    const rootCell = new Cell(() => {
      callCount++;
      return obsCell.get();
    });
    const obsCell = new ObsValueCell(set);
    checkSupport(set, 0, false);
    checkSupport(obsCell.value, 0, false);

    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(callCount).eq(1);
    expect(rootOnChange).toBeCalledTimes(1);
    checkSupport(set, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    /**
     * add
     */
    let result: any = set.add('hello');
    expect(result).eq(set);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(2);
    expect(rootCell.value.size).eq(1);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    result = set.add('hello');
    expect(result).eq(set);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(2);
    expect(rootCell.value.size).eq(1);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    result = set.add('world');
    expect(result).eq(set);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(3);
    expect(rootCell.value.size).eq(2);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    /**
     * delete
     */
    result = set.delete('world');
    expect(result).True();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(4);
    expect(rootCell.value.size).eq(1);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    result = set.delete('world');
    expect(result).False();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(4);
    expect(rootCell.value.size).eq(1);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    /**
     * clear
     */
    result = set.clear();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(5);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    result = set.clear();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(5);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    /**
     * set-prop / delete-prop
     */
    set['hello'] = 123;
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(6);
    expect(rootCell.value.size).eq(0);
    expect(set).toHaveProperty('hello', 123)
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);

    delete set['hello'];
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(7);
    expect(rootCell.value.size).eq(0);
    expect(set).not.toHaveProperty('hello');
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);


    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(7);
    checkSupport(set, 0, false);
    checkSupport(obsCell.value, 0, false);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [set, false, false, 0, 0, false, false, false]);
    checkFields(obsCell, [set, true, false, 0, 0, false, false, false]);

    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(8);
    expect(rootCell.value.size).eq(0);
    checkSupport(set, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    checkFields(rootCell, [set, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [set, true, true, 0, 1, false, false, false]);
  });

});
