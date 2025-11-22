import {delayAsync, isEqual} from '@do-while-for-each/common';
import {Throw} from '@do-while-for-each/test';
import {instanceTomAndJerry, objTomAndJerry, TomAndJerry} from './util/tom-and-jerry';
import {actualizeScheduledCells, autorun, cell, makeObservable} from '../../..';
import {checkFields} from '../../util'

describe('06_autorun', () => {

  test('Tom and Jerry, object', () => {
    checkTomAndJerry(objTomAndJerry());
  });

  test('Tom and Jerry, constructor', () => {
    checkTomAndJerry(instanceTomAndJerry());
  });

  test('error occurs at the subscription stage', () => {
    const obj = {
      full() {
        throw 123;
      }
    };
    makeObservable(obj, {
      full: cell,
    });
    const onChange = jest.fn();
    expect(onChange).toBeCalledTimes(0);
    const {rootCell} = autorun(() => obj.full(), {onChange});
    expect(onChange).toBeCalledTimes(0);
    Throw(() => rootCell.get(), '123');
  });

  test('dispose -> #1 root cell has no dependencies', async () => {
    const obj = {
      name: 'Alex',
      getName() {
        return this.name;
      }
    };
    makeObservable(obj, {
      name: cell,
      getName: cell,
    });
    const dispose = autorun(() => {
      obj.getName();
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    dispose();
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

  test('result -> #2 функция возвращает результат', async () => {
    const obj = new A();
    obj.isReady = true;
    const dispose = autorun(() => obj.isReady);
    const {rootCell} = dispose;
    checkFields(rootCell, [true, true, true, 1, 0, true, true, false]);

    dispose();
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);

    obj.isReady = false;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);

    obj.isReady = true;
    await delayAsync(10);
    checkFields(rootCell, [true, false, false, 0, 0, false, false, false]);
  });

  test('dispose -> #3 root cell has no dependencies', async () => {
    const obj = {
      name: 'Alex',
      getName() {
        return this.name;
      }
    };
    makeObservable(obj, {
      name: cell,
      getName: cell,
    });
    const dispose = autorun(() => {
      obj.getName();
    });
    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.name = 'Naruto'; // schedule rootCell before dispose!!!
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    dispose();
    await delayAsync(10);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

  test('skipInitChange', () => {
    {
      const obj = new TomAndJerry();
      let runCount = 0;
      let fullName = '';
      autorun(() => {
        runCount++;
        fullName = obj.fullName();
      });

      expect(runCount).eq(1);
      expect(fullName).eq('Tom Cat');

      obj.kind = 'сорокапут';
      expect(runCount).eq(1);
      expect(fullName).eq('Tom Cat');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(fullName).eq('Tom сорокапут');
    }
    {
      const obj = new TomAndJerry();
      let runCount = 0;
      let fullName = '';
      autorun(() => {
        runCount++;
        fullName = obj.fullName();
      }, {skipInitResult: true});

      expect(runCount).eq(1);
      expect(fullName).eq('Tom Cat');

      obj.kind = 'сорокапут';
      expect(runCount).eq(1);
      expect(fullName).eq('Tom Cat');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(fullName).eq('Tom сорокапут');
    }
    {
      const obj = new TomAndJerry();
      let runCount = 0;
      let runChangeCount = 0;
      let fullName = '';
      const dispose = autorun(() => {
        runCount++;
        return obj.fullName();
      }, {
        onChange: value => {
          runChangeCount++;
          fullName = value;
        }
      });

      expect(runCount).eq(1);
      expect(runChangeCount).eq(1); // произошел вызов onChange после инициализации дерева
      expect(fullName).eq('Tom Cat');

      obj.kind = 'сорокапут';
      expect(runCount).eq(1);
      expect(runChangeCount).eq(1);
      expect(fullName).eq('Tom Cat');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(2);
      expect(fullName).eq('Tom сорокапут');

      dispose();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(2);
      expect(fullName).eq('Tom сорокапут');
    }
    {
      const obj = new TomAndJerry();
      let runCount = 0;
      let runChangeCount = 0;
      let fullName = '';
      const dispose = autorun(() => {
        runCount++;
        return obj.fullName();
      }, {
        skipInitResult: true,
        onChange: value => {
          runChangeCount++;
          fullName = value;
        }
      });

      expect(runCount).eq(1);
      expect(runChangeCount).eq(0); // пропущен вызов onChange после инициализации дерева
      expect(fullName).eq('');

      obj.kind = 'сорокапут';
      expect(runCount).eq(1);
      expect(runChangeCount).eq(0);
      expect(fullName).eq('');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(1);
      expect(fullName).eq('Tom сорокапут');

      dispose();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(1);
      expect(fullName).eq('Tom сорокапут');
    }
  });

  test('debounceTimeToProcessChanges', async () => {
    const check = async (debounceWaitTime: number | undefined, actualizeAsync?: boolean) => {
      const actualize = async () => {
        if (actualizeAsync)
          return delayAsync(0); // подождать пока они ячейки сами актуализируются в микротаске
        actualizeScheduledCells(); // либо принудительно вызвать синхронную актуализацию
      };

      const result: Array<{ name: string; countRootCellBody: number; countOnChange: number; }> = [];
      let countRootCellBody = 0;
      let countOnChange = 0;
      const obj = new TomAndJerry();
      autorun(() => {
        countRootCellBody++;
        return obj.name;
      }, {
        debounceTimeToProcessChanges: debounceWaitTime,
        onChange: name => {
          countOnChange++;
          result.push({name, countRootCellBody, countOnChange});
        },
      })

      // после инициализации RootCell countRootCellBody=1
      obj.name = 'Flash';
      obj.name = 'Antman';
      obj.name = 'Batman';
      await actualize(); // после актуализации countRootCellBody=2

      obj.name = 'Aquaman';
      obj.name = 'Joker';
      obj.name = 'Superman';
      await actualize(); // после актуализации countRootCellBody=3

      return result;
    };

    { // 1. Нет дебонса. Актуализация ячеек синхронно.
      const result = await check(undefined);
      await delayAsync(10);
      expect(result.length).eq(3)
      expect(isEqual(result[0], {name: 'Tom', countRootCellBody: 1, countOnChange: 1})).True();
      expect(isEqual(result[1], {name: 'Batman', countRootCellBody: 2, countOnChange: 2})).True();
      expect(isEqual(result[2], {name: 'Superman', countRootCellBody: 3, countOnChange: 3})).True();
      console.log(``, result);
    }
    { // 2. Есть дебонс. Актуализация ячеек синхронно.
      const result = await check(0);
      await delayAsync(10);
      expect(result.length).eq(1)
      expect(isEqual(result[0], {name: 'Superman', countRootCellBody: 3, countOnChange: 1})).True();
      console.log(``, result);
    }
    { // 3. Нет дебонса. Актуализация ячеек Асинхронно.
      const result = await check(undefined, true);
      await delayAsync(10);
      expect(result.length).eq(3)
      expect(isEqual(result[0], {name: 'Tom', countRootCellBody: 1, countOnChange: 1})).True();
      expect(isEqual(result[1], {name: 'Batman', countRootCellBody: 2, countOnChange: 2})).True();
      expect(isEqual(result[2], {name: 'Superman', countRootCellBody: 3, countOnChange: 3})).True();
      console.log(``, result);
    }
    { // 4. Есть дебонс = 0 мс. Актуализация ячеек Асинхронно.
      const result = await check(0, true);
      await delayAsync(10);
      expect(result.length).eq(2)
      expect(isEqual(result[0], {name: 'Batman', countRootCellBody: 2, countOnChange: 1})).True();
      expect(isEqual(result[1], {name: 'Superman', countRootCellBody: 3, countOnChange: 2})).True();
      console.log(``, result);
    }
    { // 5. Есть дебонс = 5 мс. Актуализация ячеек Асинхронно.
      const result = await check(5, true);
      await delayAsync(10);
      expect(result.length).eq(1);
      expect(isEqual(result[0], {name: 'Superman', countRootCellBody: 3, countOnChange: 1})).True();
      console.log(``, result);
    }
  });

});

function checkTomAndJerry(target) {
  let result;
  const dispose = autorun(() => {
    result = target.fullName();
  });
  expect(result).eq('Tom Cat');

  target.name = 'Jerry';
  target.kind = 'Mouse';
  expect(result).eq('Tom Cat');
  actualizeScheduledCells();
  expect(result).eq('Jerry Mouse');

  dispose();
  target.name = 'Hello';
  target.kind = 'World';
  expect(result).eq('Jerry Mouse');
  actualizeScheduledCells();
  expect(result).eq('Jerry Mouse');
}


//region Support

class A {
  isReady = false;

  constructor() {
    makeObservable(this, {
      isReady: cell,
    })
  }
}

//endregion Support
