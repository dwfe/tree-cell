import {delayAsync} from '@do-while-for-each/common';
import '@do-while-for-each/test';
import {Check, checkFields} from '../../util';
import {Cell, AsyncCell} from '../../..';

class AsyncErrorApi {

  m = new Cell(() => {
    const value = this.triggerMError.get();
    if (value > 7)
      throw new Error('err inside of tree');
    return value;
  });
  triggerMError = new Cell<any>(5);

  triggerServerRequestError = new Cell(false);

  async request(): Promise<string> {
    const mValue = this.m.get();
    const hasServerError = this.triggerServerRequestError.get();
    const requestResult = await new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (hasServerError)
          reject('err request to the server');
        resolve('request ok');
      }, 50);
    });
    return `m[${mValue}] ${requestResult}`;
  }
}

describe('02_AsyncCell_fn_Promise_error', () => {

  test('check', async () => {
    const api = new AsyncErrorApi();
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(() => api.request());
    const sourceCell = asyncCell['sourceCell'];

    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(asyncCell, [null, true, false, 0, 0, false, false, false]);
    checkFields(sourceCell, [undefined, false, false, 0, 0, false, false, false]);

    // инициализация
    // подписка к root-ячейке
    // первый вызов AsyncCell.source.fn()
    const rootOnChange = jest.fn();
    const rootOnError = jest.fn();
    const rootOnValue = jest.fn();
    rootCell.onChange(rootOnChange);
    rootCell.onValue(rootOnValue);
    rootCell.onError(rootOnError);
    expect(rootOnChange).toBeCalledTimes(1);
    expect(rootOnValue).toBeCalledTimes(0);
    expect(rootOnError).toBeCalledTimes(0);
    checkFields(rootCell, [null, true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, [null, true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
    let sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // дождаться ответа от сервера -> авто-актуализация root-ячейки
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(2);
    expect(rootOnValue).toBeCalledTimes(1);
    expect(rootOnError).toBeCalledTimes(0);
    checkFields(rootCell, ['m[5] request ok', true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, ['m[5] request ok', true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
    expect(sourceCell.value).eq(sourceValue);

    // перевожу в состояние ошибки - ошибка при запросе сервера
    api.triggerServerRequestError.set(true);
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(3);
    expect(rootOnValue).toBeCalledTimes(1);
    expect(rootOnError).toBeCalledTimes(1);
    checkFields(rootCell, ['m[5] request ok', true, true, 1, 0, true, true, 'err request to the server']);
    checkFields(asyncCell, ['m[5] request ok', true, true, 0, 1, false, false, 'err request to the server']);
    checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // вывожу из состояния ошибки, когда значение совпадает с прошлым значением
    api.triggerServerRequestError.set(false);
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(3);
    expect(rootOnValue).toBeCalledTimes(1);
    expect(rootOnError).toBeCalledTimes(1);
    checkFields(rootCell, ['m[5] request ok', true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, ['m[5] request ok', true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // перевожу в состояние ошибки - ошибка при синхронном выполнении кода до запроса к серверу
    api.triggerMError.set(10);
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(4);
    expect(rootOnValue).toBeCalledTimes(1);
    expect(rootOnError).toBeCalledTimes(2);
    checkFields(rootCell, ['m[5] request ok', true, true, 1, 0, true, true, 'err inside of tree']);
    checkFields(asyncCell, ['m[5] request ok', true, true, 0, 1, false, false, 'err inside of tree']);
    checkFields(sourceCell, [Check.SKIP, true, true, 2, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // вывожу из состояния ошибки, когда значение не совпадает с прошлым значением
    api.triggerMError.set(1);
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(5);
    expect(rootOnValue).toBeCalledTimes(2);
    expect(rootOnError).toBeCalledTimes(2);
    checkFields(rootCell, ['m[1] request ok', true, true, 1, 0, true, true, false]);
    checkFields(asyncCell, ['m[1] request ok', true, true, 0, 1, false, false, false]);
    checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // перевожу в состояние ошибки - ошибка при синхронном выполнении кода до запроса к серверу
    api.triggerMError.set(38);
    await delayAsync(100);
    expect(rootOnChange).toBeCalledTimes(6);
    expect(rootOnValue).toBeCalledTimes(2);
    expect(rootOnError).toBeCalledTimes(3);
    checkFields(rootCell, ['m[1] request ok', true, true, 1, 0, true, true, 'err inside of tree']);
    checkFields(asyncCell, ['m[1] request ok', true, true, 0, 1, false, false, 'err inside of tree']);
    checkFields(sourceCell, [Check.SKIP, true, true, 2, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);

    // останов root-ячейки, когда она находится в состоянии ошибки
    rootCell.dispose();
    expect(rootOnChange).toBeCalledTimes(6);
    expect(rootOnValue).toBeCalledTimes(2);
    expect(rootOnError).toBeCalledTimes(3);
    checkFields(rootCell, ['m[1] request ok', false, false, 0, 0, false, false, 'err inside of tree']);
    checkFields(asyncCell, ['m[1] request ok', true, false, 0, 0, false, false, 'err inside of tree']);
    checkFields(sourceCell, [Check.SKIP, false, false, 0, 0, false, false, false]);
    expect(sourceCell.value).eq(sourceValue);

    // ошибка в процессе инициализации
    rootCell.onError(rootOnError);
    rootCell.onValue(rootOnValue);
    rootCell.onChange(rootOnChange);
    expect(rootOnChange).toBeCalledTimes(6);
    expect(rootOnValue).toBeCalledTimes(2);
    expect(rootOnError).toBeCalledTimes(4);
    checkFields(rootCell, ['m[1] request ok', true, true, 1, 0, true, true, 'err inside of tree']);
    checkFields(asyncCell, ['m[1] request ok', true, true, 0, 1, false, false, 'err inside of tree']);
    checkFields(sourceCell, [Check.SKIP, true, true, 2, 0, true, true, false]);
    expect(sourceCell.value).not.eq(sourceValue);
    sourceValue = sourceCell.value;
    expect(sourceValue).toBeInstanceOf(Promise);
  });

});
