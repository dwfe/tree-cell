import {delayAsync} from '@do-while-for-each/common';
import {Throw} from '@do-while-for-each/test';
import {AsyncCell, Cell} from '../../..';
import {checkFields} from '../../util';

const message = 'AsyncCell.sourceCell cannot process value';

function wrongResultForSourceCell() {
  return 123;
}

describe('06_AsyncCell_cannot-process-value_error', () => {

  test('wrong result from sourceCell', async () => {
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(wrongResultForSourceCell as any);
    const sourceCell = asyncCell['sourceCell'];

    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [null, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [undefined, false, false, 0, 0, false, false, false]);

    // инициализация
    const rootOnChange = jest.fn();
    const rootOnValue = jest.fn();
    const rootOnError = jest.fn();
    rootCell.onChange(rootOnChange);
    rootCell.onValue(rootOnValue);
    rootCell.onError(rootOnError);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(rootOnValue).toBeCalledTimes(0);
    expect(rootOnError).toBeCalledTimes(0);
    checkFields(rootCell, [null, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [null, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [123, true, true, 1, 0, true, true, false]);

    // возникает ошибка
    await delayAsync(0);
    expect(rootOnChange).toBeCalledTimes(2);
    expect(rootOnValue).toBeCalledTimes(0);
    expect(rootOnError).toBeCalledTimes(1);
    checkFields(rootCell, [null, true, true, 1, 0, true, true, message]);
    checkFields(asyncCell, [null, true, true, 0, 1, false, false, message]);
    checkFields(sourceCell, [123, true, true, 1, 0, true, true, false]);

    // останов
    rootCell.offChange(rootOnChange);
    rootCell.offValue(rootOnValue);
    rootCell.offError(rootOnError);
    expect(rootOnChange).toBeCalledTimes(2);
    expect(rootOnValue).toBeCalledTimes(0);
    expect(rootOnError).toBeCalledTimes(1);
    checkFields(rootCell, [null, false, false, 0, 0, false, false, message]);
    checkFields(asyncCell, [null, true, false, 0, 0, false, false, message]);
    checkFields(sourceCell, [123, false, false, 0, 0, false, false, false]);

    // возобновить наблюдение
    rootCell.onError(rootOnError);
    rootCell.onValue(rootOnValue);
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(2);
    expect(rootOnValue).toBeCalledTimes(0);
    expect(rootOnError).toBeCalledTimes(2);
    checkFields(rootCell, [null, true, true, 1, 0, true, true, message]);
    checkFields(asyncCell, [null, true, true, 0, 1, false, false, message]);
    checkFields(sourceCell, [123, true, true, 1, 0, true, true, false]);
    Throw(() => rootCell.get(), message);

    // останов
    rootCell.offError(rootOnError);
    rootCell.offValue(rootOnValue);
    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(2);
    expect(rootOnValue).toBeCalledTimes(0);
    expect(rootOnError).toBeCalledTimes(2);
    checkFields(rootCell, [null, false, false, 0, 0, false, false, message]);
    checkFields(asyncCell, [null, true, false, 0, 0, false, false, message]);
    checkFields(sourceCell, [123, false, false, 0, 0, false, false, false]);
  });

});
