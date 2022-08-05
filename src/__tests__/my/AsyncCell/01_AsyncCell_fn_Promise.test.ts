import {delayAsync} from '@do-while-for-each/common';
import '@do-while-for-each/test';
import {AsyncCell, Cell, ICell} from '../../..';
import {Check, checkFields} from '../../util';

class AsyncApi {
  w = new Cell(() => this.triggerW.get());
  triggerW = new Cell(7);

  p = new Cell(() => this.triggerP.get());
  triggerP = new Cell(5);

  z = new Cell(() => this.triggerZ.get());
  triggerZ = new Cell(3);

  async request(): Promise<string> {
    const w = `w[${this.w.get()}]`;
    const p = await new Promise(resolve => {
      const pValue = this.p.get();
      setTimeout(() => resolve(`p[${pValue}]`), 50); // e.g. request to the server
    });
    return `${w} ${p} z[${this.z.get()}]`;
  }
}

let api: AsyncApi;

beforeEach(() => {
  api = new AsyncApi();
});

describe('01_AsyncCell_fn_Promise', () => {

  test('Promise', async () => {
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(() => api.request());
    await checkPromise(rootCell, asyncCell, null);
  });

  test('Promise + startWith', async () => {
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(() => api.request(), {startWith: 'Naruto'});
    await checkPromise(rootCell, asyncCell, 'Naruto');
  });

  test('same Promise', async () => {
    const samePromise = new Promise(resolve => resolve(123));
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(() => samePromise);
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

});


async function checkPromise(rootCell: ICell, asyncCell: ICell, startWith: any) {
  const sourceCell = asyncCell['sourceCell'];
  checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  checkFields(asyncCell, [startWith, true, false, 0, 0, false, false, false]);
  checkFields(sourceCell, [undefined, false, false, 0, 0, false, false, false]);

  // инициализация
  // подписка к root-ячейке
  // первый вызов AsyncCell.source.fn()
  const rootOnChange = jest.fn();
  rootCell.onChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(1);
  checkFields(rootCell, [startWith, true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, [startWith, true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
  let sourceValue = sourceCell.value;
  expect(sourceValue).toBeInstanceOf(Promise);

  // дождаться ответа от сервера -> авто-актуализация root-ячейки
  await delayAsync(100);
  expect(rootOnChange).toBeCalledTimes(2);
  checkFields(rootCell, ['w[7] p[5] z[3]', true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, ['w[7] p[5] z[3]', true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
  expect(sourceCell.value).eq(sourceValue);

  // изменение зависимости AsyncCell.source.fn
  // второй вызов AsyncCell.source.fn()
  api.triggerW.set(8);
  await delayAsync(100); // подождать пока придет ответ от сервера -> авто-актуализация root-ячейки
  expect(rootOnChange).toBeCalledTimes(3);
  checkFields(rootCell, ['w[8] p[5] z[3]', true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, ['w[8] p[5] z[3]', true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
  expect(sourceCell.value).not.eq(sourceValue);
  sourceValue = sourceCell.value;
  expect(sourceValue).toBeInstanceOf(Promise);

  // изменение ложной зависимости
  // см. функцию Api.request, ячейка z находится за асинхронщиной, поэтому и не попадает в зависимости,
  // и, как следствие, при изменении ячейки triggerZ ячейка rootCell не видит этого
  api.triggerZ.set(4);
  await delayAsync(100); // подождать, хоть это и бессмысленно
  expect(rootOnChange).toBeCalledTimes(3);
  checkFields(rootCell, ['w[8] p[5] z[3]', true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, ['w[8] p[5] z[3]', true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
  expect(sourceCell.value).eq(sourceValue);

  // изменение зависимости AsyncCell.source.fn
  // третий вызов AsyncCell.source.fn()
  api.triggerP.set(6);
  await delayAsync(100); // подождать пока придет ответ от сервера -> авто-актуализация root-ячейки
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, ['w[8] p[6] z[4]', true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, ['w[8] p[6] z[4]', true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
  expect(sourceCell.value).not.eq(sourceValue);
  sourceValue = sourceCell.value;
  expect(sourceValue).toBeInstanceOf(Promise);

  // останов наблюдения за root-ячейкой
  rootCell.offChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, ['w[8] p[6] z[4]', false, false, 0, 0, false, false, false]);
  checkFields(asyncCell, ['w[8] p[6] z[4]', true, false, 0, 0, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, false, false, 0, 0, false, false, false]);
  expect(sourceCell.value).eq(sourceValue);

  // возобновить наблюдение за root-ячейкой
  rootCell.onChange(rootOnChange);
  await delayAsync(100); // подождать пока придет ответ от сервера -> авто-актуализация root-ячейки
  expect(rootOnChange).toBeCalledTimes(4); // т.к. результат sourceCell не изменился
  checkFields(rootCell, ['w[8] p[6] z[4]', true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, ['w[8] p[6] z[4]', true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, true, true, 3, 0, true, true, false]);
  expect(sourceCell.value).not.eq(sourceValue);
  sourceValue = sourceCell.value;
  expect(sourceValue).toBeInstanceOf(Promise);

  // останов наблюдения за root-ячейкой
  rootCell.offChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, ['w[8] p[6] z[4]', false, false, 0, 0, false, false, false]);
  checkFields(asyncCell, ['w[8] p[6] z[4]', true, false, 0, 0, false, false, false]);
  checkFields(sourceCell, [Check.SKIP, false, false, 0, 0, false, false, false]);
  expect(sourceCell.value).eq(sourceValue);
}
