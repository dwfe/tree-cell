import {noop} from '@do-while-for-each/test';
import {actualizeScheduledCells, autorun, Cell, cell, makeObservable} from '../..';
import {checkFields} from '../util';


//region Doubler

class Doubler {
  constructor(private value) {
    makeObservable(this, {
      value: cell,
      double: cell,
    });
  }

  get double() {
    return this.value * 2;
  }

  increment() {
    this.value++;
  }
}

describe('Doubler', () => {

  test('README', () => {
    const obj = new Doubler(1);

    const dispose = autorun(() => {
      console.log(obj.double);
    });

    obj.increment();
    actualizeScheduledCells();
    obj.increment();
    actualizeScheduledCells();
    obj.increment();

    dispose();
  });

  test('check', () => {
    const obj = new Doubler(1);

    let runCount = 0;
    let runResult;

    const dispose = autorun(() => {
      runCount++;
      runResult = obj.double;
    });
    expect(runCount).eq(1);
    expect(runResult).eq(2);

    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.increment();
    expect(runCount).eq(1);
    expect(runResult).eq(2);
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    actualizeScheduledCells();
    expect(runCount).eq(2);
    expect(runResult).eq(4);
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.increment();
    expect(runCount).eq(2);
    expect(runResult).eq(4);
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    actualizeScheduledCells();
    expect(runCount).eq(3);
    expect(runResult).eq(6);
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.increment();
    expect(runCount).eq(3);
    expect(runResult).eq(6);
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    dispose();
    expect(runCount).eq(4);
    expect(runResult).eq(8);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

  test('dispose, when rootCell isActual === true', () => {
    const obj = new Doubler(1);

    let runCount = 0;
    let runResult;

    const dispose = autorun(() => {
      runCount++;
      runResult = obj.double;
    });
    expect(runCount).eq(1);
    expect(runResult).eq(2);

    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.increment();
    expect(runCount).eq(1);
    expect(runResult).eq(2);
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    actualizeScheduledCells();
    expect(runCount).eq(2);
    expect(runResult).eq(4);
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    dispose();
    expect(runCount).eq(2);
    expect(runResult).eq(4);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

});

//endregion Doubler


//region TomAndJerry

class TomAndJerry {
  name = 'Tom';
  kind = 'Cat';

  constructor() {
    makeObservable(this, {
      name: cell,
      kind: cell,
      full: cell,
    });
  }

  get full() {
    return this.name + ' ' + this.kind;
  }
}

describe('TomAndJerry', () => {

  test('README', () => {
    const obj = new TomAndJerry();

    const dispose = autorun(() => {
      console.log(obj.full);
    });

    obj.name = 'Jerry';
    obj.kind = 'Mouse';

    dispose();
  });

  test('check', () => {
    const obj = new TomAndJerry();

    let runCount = 0;
    let runResult;

    const dispose = autorun(() => {
      runCount++;
      runResult = obj.full;
    });
    expect(runCount).eq(1);
    expect(runResult).eq('Tom Cat');

    const {rootCell} = dispose;
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.name = 'Jerry';
    expect(runCount).eq(1);
    expect(runResult).eq('Tom Cat');
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    obj.kind = 'Mouse';
    expect(runCount).eq(1);
    expect(runResult).eq('Tom Cat');
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    dispose();
    expect(runCount).eq(2);
    expect(runResult).eq('Jerry Mouse');
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

});

//endregion TomAndJerry


//region TomAndJerry, on cells

class TomAndJerryOnCells {
  name = new Cell('Tom');
  kind = new Cell('Cat');

  constructor() {
    const fullDescr = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), 'full')!;
    const fullCell = new Cell(fullDescr.get!.bind(this));
    Object.defineProperty(this, 'full', { // makeObservable
      get() {
        return fullCell.get();
      }
    });
  }

  get full(): string {
    return this.name.get() + ' ' + this.kind.get();
  }
}

describe('TomAndJerry, on cells', () => {

  test('README', () => {
    const obj = new TomAndJerryOnCells();

    const rootCell = new Cell(() => { // autorun
      console.log(obj.full);
    });
    const onChangeHandler = () => {
    };
    rootCell.onChange(onChangeHandler);

    obj.name.set('Jerry');
    obj.kind.set('Mouse');

    rootCell.offChange(onChangeHandler); // dispose
  });

  test('check', () => {
    const obj = new TomAndJerryOnCells();

    let runCount = 0;
    let runResult;

    const rootCell = new Cell(() => { // autorun
      runCount++;
      runResult = obj.full;
    });
    rootCell.onChange(noop);
    expect(runCount).eq(1);
    expect(runResult).eq('Tom Cat');
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);

    obj.name.set('Jerry');
    expect(runCount).eq(1);
    expect(runResult).eq('Tom Cat');
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    obj.kind.set('Mouse');
    expect(runCount).eq(1);
    expect(runResult).eq('Tom Cat');
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);

    rootCell.offChange(noop); // dispose
    expect(runCount).eq(2);
    expect(runResult).eq('Jerry Mouse');
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
  });

});

//endregion TomAndJerry, on cells

