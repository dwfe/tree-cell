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
  });

});
