import {delayAsync} from '@do-while-for-each/common';
import {Check, checkFields} from '../../util';
import {Cell, AsyncCell} from '../../..';

class AsyncApi {
  count = 0;

  request(): Promise<number> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.count++;
        resolve(this.count);
      }, 50); // e.g. request to the server
    });
  }
}

describe('05_AsyncCell_rerun', () => {

  test('check', async () => {
    const api = new AsyncApi();
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(() => api.request());
    const sourceCell = asyncCell['sourceCell'];

    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [null, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [undefined, false, false, 0, 0, false, false, false]);

    // инициализация
    // подписка к root-ячейке
    const rootOnChange = jest.fn();
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(1);
    checkFields(rootCell, [null, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [null, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    let sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // дождаться ответа от сервера -> авто-актуализация root-ячейки
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(2);
    checkFields(rootCell, [1, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [1, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).eq(sourceValue);

    // сделать перезапрос данных с сервера
    asyncCell.rerun();
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(3);
    checkFields(rootCell, [2, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [2, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // останов наблюдения за root-ячейкой
    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(3);
    checkFields(rootCell, [2, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [2, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, false, false, 0, 0, false, false, false]);
    expect(sourceCell.value).eq(sourceValue);

    // возобновить наблюдение за root-ячейкой
    rootCell.onChange(rootOnChange);
    await delayAsync(100); // подождать пока придет ответ от сервера -> авто-актуализация root-ячейки
    expect(rootOnChange).toBeCalledTimes(4);
    checkFields(rootCell, [3, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [3, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // сделать перезапрос данных с сервера
    asyncCell.rerun();
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(5);
    checkFields(rootCell, [4, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [4, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // сделать перезапрос данных с сервера
    asyncCell.rerun();
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(6);
    checkFields(rootCell, [5, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [5, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 1, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // останов наблюдения за root-ячейкой
    rootCell.offChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(6);
    checkFields(rootCell, [5, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [5, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, false, false, 0, 0, false, false, false]);
    expect(sourceCell.value).eq(sourceValue);
  });

});
