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
    let result: any = arr.push('word');
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

    /**
     * set-prop / delete-prop
     */
    expect(arr).not.toHaveProperty('hello');
    arr['hello'] = 'world';
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(0);
    expect(arr).toHaveProperty('hello');
    expect(callCount).eq(7);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);

    delete arr['hello'];
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(0);
    expect(arr).not.toHaveProperty('hello');
    expect(callCount).eq(8);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);

    /**
     * copyWithin
     */
    arr.push(1, 2, 3, 4, 5);
    actualizeScheduledCells();
    expect(callCount).eq(9);
    expect(rootOnChange).toBeCalledTimes(1);

    result = arr.copyWithin(0, 3, 4);
    actualizeScheduledCells();
    checkValue(result, [4, 2, 3, 4, 5]);
    expect(rootCell.value.length).eq(5);
    expect(callCount).eq(10);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [4, 2, 3, 4, 5]);

    /**
     * set-by-index
     */
    result = arr[1] = 7;
    actualizeScheduledCells();
    expect(result).eq(7);
    expect(rootCell.value.length).eq(5);
    expect(callCount).eq(11);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [4, 7, 3, 4, 5]);

    /**
     * set-length
     */
    result = arr.length = 0;
    actualizeScheduledCells();
    expect(result).eq(0);
    expect(rootCell.value.length).eq(0);
    expect(callCount).eq(12);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);

    result = arr.length = 2;
    actualizeScheduledCells();
    expect(result).eq(2);
    expect(rootCell.value.length).eq(2);
    expect(callCount).eq(13);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [undefined, undefined]);

    /**
     * fill
     */
    arr.length = 0;
    actualizeScheduledCells();
    expect(callCount).eq(14);
    checkValue(rootCell, []);
    arr.push(1, 2, 3);
    actualizeScheduledCells();
    expect(callCount).eq(15);
    checkValue(rootCell, [1, 2, 3]);

    result = arr.fill(4, 1, 2);
    expect(result).eq(arr);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(3);
    expect(callCount).eq(16);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [1, 4, 3]);

    /**
     * reverse
     */
    result = arr.reverse();
    expect(result).eq(arr);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(3);
    expect(callCount).eq(17);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [3, 4, 1]);

    /**
     * shift
     */
    result = arr.shift();
    expect(result).eq(3);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(2);
    expect(callCount).eq(18);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [4, 1]);

    result = arr.shift();
    expect(result).eq(4);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(1);
    expect(callCount).eq(19);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [1]);

    result = arr.shift();
    expect(result).eq(1);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(0);
    expect(callCount).eq(20);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);

    result = arr.shift();
    expect(result).eq(undefined);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(0);
    expect(callCount).eq(20);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);

    /**
     * sort
     */
    arr.length = 0;
    actualizeScheduledCells();
    expect(callCount).eq(21);
    checkValue(rootCell, []);
    arr.push('80', '9', '700', 40, 1, 5, 200);
    actualizeScheduledCells();
    expect(callCount).eq(22);
    checkValue(rootCell, ['80', '9', '700', 40, 1, 5, 200]);

    result = arr.sort();
    checkValue(result, [1, 200, 40, 5, '700', '80', '9']);
    expect(result).eq(arr);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(7);
    expect(callCount).eq(23);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [1, 200, 40, 5, '700', '80', '9']);

    result = arr.sort((a, b) => a - b);
    checkValue(result, [1, 5, '9', 40, '80', 200, '700']);
    expect(result).eq(arr);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(7);
    expect(callCount).eq(24);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [1, 5, '9', 40, '80', 200, '700']);

    /**
     * splice
     */
    result = arr.splice(3, 10, 'hello', 'world');
    checkValue(result, [40, '80', 200, '700']);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(5);
    expect(callCount).eq(25);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, [1, 5, '9', 'hello', 'world']);

    result = arr.splice(0);
    checkValue(result, [1, 5, '9', 'hello', 'world']);
    actualizeScheduledCells();
    expect(rootCell.value.length).eq(0);
    expect(callCount).eq(26);
    expect(rootOnChange).toBeCalledTimes(1);
    checkValue(rootCell, []);

    /**
     * unshift
     */
    result = arr.unshift('word');
    expect(result).eq(1);
    actualizeScheduledCells();
    expect(callCount).eq(27);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(rootCell.value.length).eq(1);
    checkValue(rootCell, ['word']);
    checkFields(rootCell, [arr, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [arr, true, true, 0, 1, false, false, false]);

    result = arr.unshift(1, null, 'hello', false);
    expect(result).eq(5);
    actualizeScheduledCells();
    expect(callCount).eq(28);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(rootCell.value.length).eq(5);
    checkValue(rootCell, [1, null, 'hello', false, 'word']);
    checkFields(rootCell, [arr, true, true, 1, 0, true, true, false]);
    checkFields(obsCell, [arr, true, true, 0, 1, false, false, false]);
  });

});

function checkValue(cell: ICell, arr: any[]) {
  const value = (Array.isArray(cell) ? cell : cell.value) as any[];
  expect(value.length).eq(arr.length);
  for (let i = 0; i < arr.length; i++) {
    expect(value[i]).eq(arr[i]);
  }
}

export function checkSupport(obsValue: ObsValueLike, numberOfIds: number, hasListeners: boolean, numberOfListeners?: number) {
  expect(obsValue.numberOfIds).eq(numberOfIds);
  expect(obsValue.hasListeners).eq(hasListeners);
  if (numberOfListeners === undefined)
    Throw(() => obsValue.numberOfListeners(), `Cannot read properties of undefined (reading 'size')`);
  else
    expect(obsValue.numberOfListeners()).eq(numberOfListeners);
}
