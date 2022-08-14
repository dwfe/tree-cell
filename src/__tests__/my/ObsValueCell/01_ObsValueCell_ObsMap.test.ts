import {createObsMap} from '@do-while-for-each/common';
import {actualizeScheduledCells, Cell, ObsValueCell} from '../../..';
import {checkSupport} from './03_ObsValueCell_ObsArray.test';
import {checkFields} from '../../util';

describe('01_ObsValueCell_ObsMap', () => {

  test('value', () => {
    const value = createObsMap();
    let callCount = 0;
    const rootCell = new Cell(() => {
      callCount++;
      return obsCell.get();
    });
    const obsCell = new ObsValueCell(value);
    expect(callCount).eq(0);
    checkSupport(value, 0, false);
    checkSupport(obsCell.value, 0, false);

    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(1);
    checkSupport(value, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    /**
     * set
     */
    let result: any = value.set('hello', 17);
    expect(result).eq(value);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(2);
    expect(rootCell.value.size).eq(1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.set('hello', 'ok');
    expect(result).eq(value);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(3);
    expect(rootCell.value.size).eq(1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.set('world', null);
    expect(result).eq(value);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(4);
    expect(rootCell.value.size).eq(2);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    /**
     * delete
     */
    result = value.delete('hello');
    expect(result).True();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(5);
    expect(rootCell.value.size).eq(1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    /**
     * clear
     */
    value.clear();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(6);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    /**
     * set-prop / delete-prop
     */
    value['hello'] = 123;
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(7);
    expect(rootCell.value.size).eq(0);
    expect(value).toHaveProperty('hello', 123)
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    delete value['hello'];
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(8);
    expect(rootCell.value.size).eq(0);
    expect(value).not.toHaveProperty('hello');
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);


    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(8);
    checkSupport(value, 0, false);
    checkSupport(obsCell.value, 0, false);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [value, false, false, 0, 0, false, false, false]);
    checkFields(obsCell, [value, true, false, 0, 0, false, false, false]);

    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(callCount).eq(9);
    expect(rootCell.value.size).eq(0);
    checkSupport(value, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    checkFields(rootCell, [value, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);
  });

  test('value, change val', () => {
    const map = createObsMap();
    const mapTwo = createObsMap([['hello', 12], ['world', null]]);
    const rootCell = new Cell(() => obsCell.get());
    const obsCell = new ObsValueCell(map);
    checkSupport(map, 0, false);
    checkSupport(mapTwo, 0, false);
    checkSupport(obsCell.value, 0, false);

    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    checkSupport(map, 1, true, 1);
    checkSupport(mapTwo, 0, false);
    checkSupport(obsCell.value, 1, true, 1);
    expect(rootCell.value.size).eq(0);
    checkFields(rootCell, [map, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [map, true, true, 0, 1, false, false, false]);

    obsCell.set(mapTwo);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(2);
    checkSupport(map, 0, false);
    checkSupport(mapTwo, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    expect(rootCell.value.size).eq(2);
    checkFields(rootCell, [mapTwo, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [mapTwo, true, true, 0, 1, false, false, false]);

    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(2);
    checkSupport(map, 0, false);
    checkSupport(mapTwo, 0, false);
    checkSupport(obsCell.value, 0, false);
    expect(rootCell.value.size).eq(2);
    checkFields(rootCell, [mapTwo, false, false, 0, 0, false, false, false]);
    checkFields(obsCell, [mapTwo, true, false, 0, 0, false, false, false]);

    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(2);
    checkSupport(map, 0, false);
    checkSupport(mapTwo, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    expect(rootCell.value.size).eq(2);
    checkFields(rootCell, [mapTwo, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [mapTwo, true, true, 0, 1, false, false, false]);

    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(2);
    checkSupport(map, 0, false);
    checkSupport(mapTwo, 0, false);
    checkSupport(obsCell.value, 0, false);
    expect(rootCell.value.size).eq(2);
    checkFields(rootCell, [mapTwo, false, false, 0, 0, false, false, false]);
    checkFields(obsCell, [mapTwo, true, false, 0, 0, false, false, false]);
  });

  test('fn', () => {
    const value = createObsMap();
    const obsCell = new ObsValueCell(value);
    const rootCell = new Cell(() => {
      const emitter = obsCell.get();
      return emitter.size;
    });
    checkSupport(value, 0, false);
    checkSupport(obsCell.value, 0, false);

    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    checkSupport(value, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    checkFields(rootCell, [0, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    let result: any = value.set('hello', 17);
    expect(result).eq(value);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(2);
    checkFields(rootCell, [1, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.set('hello', {name: 'Alex'}); // rootCell не меняется!!!
    expect(result).eq(value);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(2);
    checkFields(rootCell, [1, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.set('world', 7n);
    expect(result).eq(value);
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(3);
    checkFields(rootCell, [2, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    result = value.delete('hello');
    expect(result).True();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(4);
    checkFields(rootCell, [1, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    value.clear();
    actualizeScheduledCells();
    expect(rootOnChange).toBeCalledTimes(5);
    checkFields(rootCell, [0, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);

    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(5);
    checkSupport(value, 0, false);
    checkSupport(obsCell.value, 0, false);
    checkFields(rootCell, [0, false, false, 0, 0, false, false, false]);
    checkFields(obsCell, [value, true, false, 0, 0, false, false, false]);

    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(5);
    checkSupport(value, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    checkFields(rootCell, [0, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [value, true, true, 0, 1, false, false, false]);
  });

});
