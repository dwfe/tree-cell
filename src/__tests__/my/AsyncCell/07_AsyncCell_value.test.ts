import {delayAsync} from '@do-while-for-each/common';
import {Throw} from '@do-while-for-each/test';
import {asyncRangeGenerator, checkAsyncIterable} from './04_AsyncCell_fn_AsyncIterable.test';
import {checkIterable, rangeGenerator} from './03_AsyncCell_fn_Iterable.test';
import {Check, checkFields} from '../../util';
import {AsyncCell, Cell} from '../../..';

describe('07_AsyncCell_value', () => {

  test('Promise', async () => {
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(new Promise(resolve => resolve(123)));
    const sourceCell = asyncCell['sourceCell'];

    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [null, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [undefined, false, false, 0, 0, false, false, false]);

    // инициализация
    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    checkFields(rootCell, [null, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [null, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    let sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // дождаться ответа от сервера -> авто-актуализация root-ячейки
    await delayAsync(10);
    expect(rootOnChange).toBeCalledTimes(2);
    checkFields(rootCell, [123, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [123, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).eq(sourceValue);

    asyncCell.rerun();
    await delayAsync(50);
    expect(rootOnChange).toBeCalledTimes(2);
    checkFields(rootCell, [123, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [123, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).eq(sourceValue);

    // останов наблюдения за root-ячейкой
    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(2);
    checkFields(rootCell, [123, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [123, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, false, false, 0, 0, false, false, false]);
    expect(sourceCell.value).eq(sourceValue);

    // возобновить наблюдение за root-ячейкой
    rootCell.onChange(rootOnChange);
    await delayAsync(50); // подождать пока придет ответ от сервера -> авто-актуализация root-ячейки
    expect(rootOnChange).toBeCalledTimes(2); // т.к. результат sourceCell не изменился
    checkFields(rootCell, [123, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [123, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).eq(sourceValue);

    // останов наблюдения за root-ячейкой
    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(2);
    checkFields(rootCell, [123, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [123, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, false, false, 0, 0, false, false, false]);
    expect(sourceCell.value).eq(sourceValue);
  });

  test('AsyncIterable', async () => {
    await checkAsyncIterable(asyncRangeGenerator, asyncRangeGenerator);
  });

  test('Iterable', async () => {
    await checkIterable(rangeGenerator, rangeGenerator);
  });

  test('error: AsyncCell.sourceCell cannot process value', () => {
    Throw(() => new AsyncCell('hello' as unknown as any), 'AsyncCell.sourceCell cannot process value');
  });

});
