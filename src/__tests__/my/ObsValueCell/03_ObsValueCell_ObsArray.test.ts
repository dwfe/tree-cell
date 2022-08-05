import {createObsArray, ObsValueLike} from '@do-while-for-each/common';
import {Throw} from '@do-while-for-each/test';
import {actualizeScheduledCells, Cell, ICell, ObsValueCell} from '../../..';
import {checkFields} from '../../util';

describe('03_ObsValueCell_ObsArray', () => {

  test('value', () => {
    const arr = createObsArray<any>();
    let callCount = 0;
    const rootCell = new Cell(() => {
      callCount++;
      return obsCell.get();
    });
    const obsCell = new ObsValueCell(arr);
    checkSupport(arr, 0, false);
    checkSupport(obsCell.value, 0, false);

    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(callCount).eq(1);
    expect(rootOnChange).toBeCalledTimes(1);
    checkSupport(arr, 1, true, 1);
    checkSupport(obsCell.value, 1, true, 1);
    expect(rootCell.value.length).eq(0);
    checkFields(rootCell, [arr, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [arr, true, true, 0, 1, false, false, false]);

    /**
     * push
     */
    let result = arr.push('word');
    expect(result).eq(1);
    actualizeScheduledCells();
    expect(callCount).eq(2);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(rootCell.value.length).eq(1);
    checkValue(rootCell, ['word']);
    checkFields(rootCell, [arr, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [arr, true, true, 0, 1, false, false, false]);

    result = arr.push(1, null, 'hello', false);
    expect(result).eq(5);
    actualizeScheduledCells();
    expect(callCount).eq(3);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(rootCell.value.length).eq(5);
    checkValue(rootCell, ['word', 1, null, 'hello', false]);
    checkFields(rootCell, [arr, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [arr, true, true, 0, 1, false, false, false]);

    /**
     * pop
     */
    result = arr.pop();
    expect(result).eq(false);
    expect(rootCell.value.length).eq(4);
    actualizeScheduledCells();
    expect(callCount).eq(4);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, ['word', 1, null, 'hello']);

    result = arr.pop();
    expect(result).eq('hello');
    expect(rootCell.value.length).eq(3);
    actualizeScheduledCells();
    expect(callCount).eq(5);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, ['word', 1, null]);

    result = arr.pop();
    expect(result).eq(null);
    expect(rootCell.value.length).eq(2);
    checkValue(rootCell, ['word', 1]);
    result = arr.pop();
    expect(result).eq(1);
    expect(rootCell.value.length).eq(1);
    checkValue(rootCell, ['word']);
    result = arr.pop();
    expect(result).eq('word');
    expect(rootCell.value.length).eq(0);
    checkValue(rootCell, []);
    actualizeScheduledCells();
    expect(callCount).eq(6);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);

    result = arr.pop();
    expect(result).eq(undefined);
    expect(rootCell.value.length).eq(0);
    actualizeScheduledCells();
    expect(callCount).eq(6);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);


  });

});

function checkValue(cell: ICell, arr: any[]) {
  expect(cell.value.length).eq(arr.length);
  for (let i = 0; i < arr.length; i++) {
    expect(cell.value[i]).eq(arr[i]);
  }
}

export function checkSupport(arr: ObsValueLike, numberOfIds: number, hasListeners: boolean, numberOfListeners?: number) {
  expect(arr.numberOfIds).eq(numberOfIds);
  expect(arr.hasListeners).eq(hasListeners);
  if (numberOfListeners === undefined)
    Throw(() => arr.numberOfListeners(), `Cannot read properties of undefined (reading 'size')`);
  else
    expect(arr.numberOfListeners()).eq(numberOfListeners);
}
