import {delayAsync} from '@do-while-for-each/common';
import {AsyncCell, Cell} from '../../..';
import {checkFields} from '../../util';

const range = { // Iterable
  from: 1,
  to: 3,

  // 1. вызов for..of сначала вызывает эту функцию
  [Symbol.iterator]: function () {

    // ...она возвращает объект итератора:
    // 2. Далее, for..of работает только с этим итератором, запрашивая у него новые значения
    return {
      current: this.from,
      last: this.to,

      // 3. next() вызывается на каждой итерации цикла for..of
      next(): IteratorResult<number> {
        // 4. он должен вернуть значение в виде объекта {done:.., value :...}
        if (this.current <= this.last)
          return {done: false, value: this.current++};
        else
          return {done: true, value: 'I am done'};
      }
    };
  }
};

export const rangeGenerator = { // Iterable
  from: 1,
  to: 3,

  * [Symbol.iterator]() { // краткая запись для [Symbol.iterator]: function*()
    for (let i = this.from; i <= this.to; i++) {
      yield i;
    }
  }
};

describe('03_AsyncCell_fn_Iterable', () => {

  test('handmade iterable', async () => {
    await checkIterable(range, () => range);
  });

  test('generator', async () => {
    await checkIterable(rangeGenerator, () => rangeGenerator);
  });

});

export async function checkIterable(iterable: Iterable<any>, sourceVal: any) {
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
  checkFields(sourceCell, [iterable, true, true, 1, 0, true, true, false]);
  await delayAsync(100);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, [3, true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, [3, true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [iterable, true, true, 1, 0, true, true, false]);

  // останов наблюдения
  rootCell.offChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, [3, false, false, 0, 0, false, false, false]);
  checkFields(asyncCell, [3, true, false, 0, 0, false, false, false]);
  checkFields(sourceCell, [iterable, false, false, 0, 0, false, false, false]);

  // возобновление наблюдения
  rootCell.onChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  await delayAsync(100);
  expect(rootOnChange).toBeCalledTimes(4); // т.к. iterable объект для sourceCell не изменился
  checkFields(rootCell, [3, true, true, 1, 0, true, true, false]);
  checkFields(asyncCell, [3, true, true, 0, 1, false, false, false]);
  checkFields(sourceCell, [iterable, true, true, 1, 0, true, true, false]);

  // останов наблюдения
  rootCell.offChange(rootOnChange);
  expect(rootOnChange).toBeCalledTimes(4);
  checkFields(rootCell, [3, false, false, 0, 0, false, false, false]);
  checkFields(asyncCell, [3, true, false, 0, 0, false, false, false]);
  checkFields(sourceCell, [iterable, false, false, 0, 0, false, false, false]);
}
