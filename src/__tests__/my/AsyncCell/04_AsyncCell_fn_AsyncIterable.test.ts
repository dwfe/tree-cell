import {delayAsync} from '@do-while-for-each/common';
import {AsyncCell, Cell} from '../../..';
import {checkFields} from '../../util';

const asyncRange = { // AsyncIterable
  from: 1,
  to: 3,

  // for await..of вызывает этот метод один раз в самом начале
  [Symbol.asyncIterator]() { // (1)
    // ...возвращает объект-итератор:
    // далее for await..of работает только с этим объектом,
    // запрашивая у него следующие значения вызовом next()
    return {
      current: this.from,
      last: this.to,

      // next() вызывается на каждой итерации цикла for await..of
      async next() { // (2)
        // должен возвращать значение как объект {done:.., value :...}
        // (автоматически оборачивается в промис с помощью async)

        // можно использовать await внутри для асинхронности:
        await delayAsync(100); // (3)

        if (this.current <= this.last)
          return {done: false, value: this.current++};
        else
          return {done: true, value: 'I am done'};
      }
    };
  }
};

export const asyncRangeGenerator = { // AsyncIterable
  from: 1,
  to: 3,

  async* [Symbol.asyncIterator]() { // то же, что и [Symbol.asyncIterator]: async function*()
    for (let value = this.from; value <= this.to; value++) {

      // пауза между значениями, ожидание
      await delayAsync(100);

      yield value;
    }
  }
}

describe('04_AsyncCell_fn_AsyncIterable', () => {

  test('handmade async iterable', async () => {
    await checkAsyncIterable(asyncRange, () => asyncRange);
  });

  test('async generator', async () => {
    await checkAsyncIterable(asyncRangeGenerator, () => asyncRangeGenerator);
  });

});

export async function checkAsyncIterable(asyncIterable: AsyncIterable<any>, sourceVal: any) {
  const rootCell = new Cell(() => asyncCell.get());
  const asyncCell = new AsyncCell(sourceVal);
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
  checkFields(sourceCell, [asyncIterable, true, true, 1, 0, true, true, false]);
  await delayAsync(100);
  expect(rootOnChange).toBeCalledTimes(2);
  checkFields(rootCell, [1, true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, [1, true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [asyncIterable, true, true, 1, 0, true, true, false]);
  await delayAsync(100);
  expect(rootOnChange).toBeCalledTimes(3);
  checkFields(rootCell, [2, true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, [2, true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [asyncIterable, true, true, 1, 0, true, true, false]);
  await delayAsync(100);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, [3, true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, [3, true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [asyncIterable, true, true, 1, 0, true, true, false]);

  // останов наблюдения
  rootCell.offChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, [3, false, false, 0, 0, false, false, false]);
  checkFields(asyncCell, [3, true, false, 0, 0, false, false, false]);
  checkFields(sourceCell, [asyncIterable, false, false, 0, 0, false, false, false]);

  // возобновление наблюдения
  rootCell.onChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  await delayAsync(100);
  expect(rootOnChange).toBeCalledTimes(4); // т.к. asyncIterable объект для sourceCell не изменился
  checkFields(rootCell, [3, true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, [3, true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [asyncIterable, true, true, 1, 0, true, true, false]);

  // останов наблюдения
  rootCell.offChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, [3, false, false, 0, 0, false, false, false]);
  checkFields(asyncCell, [3, true, false, 0, 0, false, false, false]);
  checkFields(sourceCell, [asyncIterable, false, false, 0, 0, false, false, false]);
}
