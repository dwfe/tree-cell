import {actualizeScheduledCells, autorun, cell, Cell, getAllCachedCells, makeObservable} from '../../..';
import {checkFields} from '../../util';

describe('07_check-fields', () => {

  test('a -> b ? m : c + subscribed', async () => {
    class Some {
      b: any = 55;
      z: any = 'hi';

      constructor() {
        makeObservable(this, {
          a: cell,
          b: cell,
          m: cell,
          z: cell,
          c: cell,
        });
      }

      get a() {
        return this.b ? this.m : this.c;
      }

      get m() {
        return this.z;
      }

      get c() {
        return 1;
      }
    }

    const obj = new Some();
    expect(Object.keys(getAllCachedCells(obj)!).length).eq(5);
    const {a, b, m, z, c} = getAllCachedCells(obj)!;
    expect(a).toBeInstanceOf(Cell);
    expect(b).toBeInstanceOf(Cell);
    expect(m).toBeInstanceOf(Cell);
    expect(z).toBeInstanceOf(Cell);
    expect(c).toBeInstanceOf(Cell);

    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [55, true, false, 0, 0, false, false, false]);
    checkFields(m, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [undefined, false, false, 0, 0, false, false, false]);

    let dispose = autorun(() => {
      obj.a;
    });
    let {rootCell} = dispose;
    expect(Object.keys(getAllCachedCells(obj)!).length).eq(5);
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);
    checkFields(a, ['hi', true, true, 2, 1, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [55, true, true, 0, 1, false, false, false]);
    checkFields(m, ['hi', true, true, 1, 1, true, true, false]);
    checkFields(z, ['hi', true, true, 0, 1, false, false, false]);
    checkFields(c, [undefined, false, false, 0, 0, false, false, false]);

    obj.b = null;
    actualizeScheduledCells();
    checkFields(rootCell, [undefined, false, true, 1, 0, true, true, false]);
    checkFields(a, [1, true, true, 2, 1, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(c)).True();
    checkFields(b, [null, true, true, 0, 1, false, false, false]);
    checkFields(m, ['hi', false, false, 0, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, true, 0, 1, false, false, false]);

    dispose();
    expect(Object.keys(getAllCachedCells(obj)!).length).eq(5);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(a, [1, false, false, 0, 0, false, false, false]);
    checkFields(b, [null, true, false, 0, 0, false, false, false]);
    checkFields(m, ['hi', false, false, 0, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    obj.b = 7;
    dispose = autorun(() => obj.a);
    rootCell = dispose.rootCell;
    expect(Object.keys(getAllCachedCells(obj)!).length).eq(5);
    checkFields(rootCell, ['hi', true, true, 1, 0, true, true, false]);
    checkFields(a, ['hi', true, true, 2, 1, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [7, true, true, 0, 1, false, false, false]);
    checkFields(m, ['hi', true, true, 1, 1, true, true, false]);
    checkFields(z, ['hi', true, true, 0, 1, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    obj.z = 'world';
    actualizeScheduledCells();
    checkFields(rootCell, ['world', true, true, 1, 0, true, true, false]);
    checkFields(a, ['world', true, true, 2, 1, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [7, true, true, 0, 1, false, false, false]);
    checkFields(m, ['world', true, true, 1, 1, true, true, false]);
    checkFields(z, ['world', true, true, 0, 1, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    dispose();
    expect(Object.keys(getAllCachedCells(obj)!).length).eq(5);
    checkFields(rootCell, ['world', false, false, 0, 0, false, false, false]);
    checkFields(a, ['world', false, false, 0, 0, false, false, false]);
    checkFields(b, [7, true, false, 0, 0, false, false, false]);
    checkFields(m, ['world', false, false, 0, 0, false, false, false]);
    checkFields(z, ['world', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    dispose = autorun(() => {
      obj.a;
    });
    rootCell = dispose.rootCell;
    expect(Object.keys(getAllCachedCells(obj)!).length).eq(5);
    checkFields(rootCell, [undefined, true, true, 1, 0, true, true, false]);
    checkFields(a, ['world', true, true, 2, 1, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [7, true, true, 0, 1, false, false, false]);
    checkFields(m, ['world', true, true, 1, 1, true, true, false]);
    checkFields(z, ['world', true, true, 0, 1, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    dispose();
    expect(Object.keys(getAllCachedCells(obj)!).length).eq(5);
    checkFields(rootCell, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(a, ['world', false, false, 0, 0, false, false, false]);
    checkFields(b, [7, true, false, 0, 0, false, false, false]);
    checkFields(m, ['world', false, false, 0, 0, false, false, false]);
    checkFields(z, ['world', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);
  });

});
