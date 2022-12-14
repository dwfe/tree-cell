import {delayAsync} from '@do-while-for-each/common';
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

  test('dispose -> #2 root cell has no dependencies', async () => {
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

      obj.kind = '??????????????????';
      expect(runCount).eq(1);
      expect(fullName).eq('Tom Cat');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(fullName).eq('Tom ??????????????????');
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

      obj.kind = '??????????????????';
      expect(runCount).eq(1);
      expect(fullName).eq('Tom Cat');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(fullName).eq('Tom ??????????????????');
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
      expect(runChangeCount).eq(1); // ?????????????????? ?????????? onChange ?????????? ?????????????????????????? ????????????
      expect(fullName).eq('Tom Cat');

      obj.kind = '??????????????????';
      expect(runCount).eq(1);
      expect(runChangeCount).eq(1);
      expect(fullName).eq('Tom Cat');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(2);
      expect(fullName).eq('Tom ??????????????????');

      dispose();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(2);
      expect(fullName).eq('Tom ??????????????????');
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
      expect(runChangeCount).eq(0); // ???????????????? ?????????? onChange ?????????? ?????????????????????????? ????????????
      expect(fullName).eq('');

      obj.kind = '??????????????????';
      expect(runCount).eq(1);
      expect(runChangeCount).eq(0);
      expect(fullName).eq('');

      actualizeScheduledCells();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(1);
      expect(fullName).eq('Tom ??????????????????');

      dispose();
      expect(runCount).eq(2);
      expect(runChangeCount).eq(1);
      expect(fullName).eq('Tom ??????????????????');
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
