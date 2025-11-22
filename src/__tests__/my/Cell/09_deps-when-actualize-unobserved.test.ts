import {cast, delayAsync} from '@do-while-for-each/common';
import '@do-while-for-each/test';
import {autorun, cell, getAllCachedCells, getCachedCell, makeObservable} from '../../../wrap';
import {ICell} from '../../../contract';
import {checkFields} from '../../util';

class Test {
  a = 1
  b = 2
  c = 3
  changes = false; // Вспомогательная ячейка для триггера изменений.

  constructor(private action: () => boolean) {
    makeObservable(this, {
      a: cell,
      b: cell,
      c: cell,
      changes: cell,
    });
  }

  get state() {
    let result = this.a;
    if (this.changes) {
      if (this.action())
        return 123;
    }
    result += this.b + this.c;
    return result;
  }

}

class Test2 {
  a = 1
  b = 2
  c = 3
  d = 7
  changes = false; // Вспомогательная ячейка для триггера изменений.

  constructor() {
    makeObservable(this, {
      a: cell,
      b: cell,
      c: cell,
      d: cell,
      changes: cell,
    });
  }

  get state() {
    let result = this.a;
    if (this.changes) {
      result += this.d
    }
    result += this.b + this.c;
    return result;
  }

}

async function process(obj: Test, resultValue: number, resultErr: any, actualizeBeforeDeath?: boolean) {
  const {a, b, c, changes} = getAllCachedCells(obj) as Record<keyof Test, ICell>;

  const dispose = autorun(() => obj.state, {
    rootCellOpt: {actualizeBeforeDeath},
  });
  const {rootCell} = dispose;

  checkFields(a, [1, true, true, 0, 1, false, false, false]);
  checkFields(b, [2, true, true, 0, 1, false, false, false]);
  checkFields(c, [3, true, true, 0, 1, false, false, false]);
  checkFields(changes, [false, true, true, 0, 1, false, false, false]);
  checkFields(rootCell, [6, true, true, 4, 0, true, true, false]);

  // 1) Корневая ячейка rootCell попадает в шедулер для актуализации.
  obj.changes = true;
  // 2) До начала процесса актуализации rootCell диспозится -> она уже больше никому не нужна.
  rootCell.dispose();
  // 3) Производится актуализация rootCell -> а затем ее деактивация.
  await delayAsync(0);

  checkFields(a, [1, true, false, 0, 0, false, false, false]);
  // checkFields(b, [1, true, true, 0, 1, false, false, false]); <- Баг: у некоторых deps ячеек rootCell
  //                                                                1. не очищалась ссылка на rootCell у них в реакциях.
  //                                                                2. Причем объект rootCell больше никогда не будет использован.
  //                                                                3. В случае, если ячейки b и c не умерали и могли бы быть переиспользованы,
  //                                                                тогда у них в реакциях повисала ссылка на мертвый объект.
  //                                                                Итог: GC не мог удалить из памяти мертвый объект rootCell,
  //                                                                      потому что на него есть ссылка из живого объекта.
  checkFields(b, [2, true, false, 0, 0, false, false, false]); // вот в этих
  checkFields(c, [3, true, false, 0, 0, false, false, false]); // двух ячейках повисала ссылка на мертвую rootCell
  checkFields(changes, [true, true, false, 0, 0, false, false, false]);
  checkFields(rootCell, [resultValue, false, false, 0, 0, false, false, resultErr]);
}

describe('09_deps-when-actualize-unobserved', () => {

  test('throw Error сокращает кол-во зависимостей', async () => {
    {
      const obj = new Test(() => {
        throw new Error('my err');
      });
      await process(obj, 6, 'my err', true);
    }
    {
      const obj = new Test(() => {
        throw new Error('my err');
      });
      await process(obj, 6, false);
    }
  });

  test('Ветвление сокращает кол-во зависимостей', async () => {
    {
      const obj = new Test(() => true);
      await process(obj, 123, false, true);
    }
    {
      const obj = new Test(() => true);
      await process(obj, 6, false);
    }
  });

  test('Не изменяется кол-во зависимостей', async () => {
    {
      const obj = new Test(() => false);
      await process(obj, 6, false, true);
    }
    {
      const obj = new Test(() => false);
      await process(obj, 6, false);
    }
  });

  test('Увеличивается кол-во зависимостей', async () => {
    {
      const obj = new Test2();
      await process(cast(obj), 13, false, true);
      const d = getCachedCell(obj, 'd')!;
      checkFields(d, [7, true, false, 0, 0, false, false, false])
    }
    {
      const obj = new Test2();
      await process(cast(obj), 6, false);
      const d = getCachedCell(obj, 'd')!;
      checkFields(d, [7, true, false, 0, 0, false, false, false])
    }
  });

});
