import {createObsObject} from '@do-while-for-each/common';
import {actualizeScheduledCells, Cell, ObsValueCell} from '../../..';
import {checkSupport} from './03_ObsValueCell_ObsArray.test';
import {checkFields} from '../../util';

describe('04_ObsValueCell_ObsObject', () => {

  test('set / delete', () => {
    const value = createObsObject();
    const obsCell = new ObsValueCell(value);
    let callCount = 0;
    const rootCell = new Cell(() => {
      callCount++;
      return obsCell.get();
    });
    expect(callCount).eq(0);
    checkSupport(value, 0, false);
    checkSupport(obsCell.value, 0, false);

    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(1);
    checkSupport(value, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    expect(Object.keys(rootCell.value).length).eq(0);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    /**
     * set
     */
    let result: any = value.hello = 17;
    expect(result).eq(17);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(2);
    expect(Object.keys(rootCell.value).length).eq(1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.hello = 'ok';
    expect(result).eq('ok');
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(3);
    expect(Object.keys(rootCell.value).length).eq(1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.hello = 'ok1';
    expect(result).eq('ok1');
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(4);
    expect(Object.keys(rootCell.value).length).eq(1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.world = null;
    expect(result).eq(null);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(5);
    expect(Object.keys(rootCell.value).length).eq(2);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    /**
     * delete
     */
    result = delete value.hello;
    expect(result).True();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(6);
    expect(Object.keys(rootCell.value).length).eq(1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);
  });

});
