import {noop} from '@do-while-for-each/test';
import {actualizeScheduledCells, Cell} from '../../..';
import {checkFields} from '../../util';

describe('01_check-fields', () => {

  test('Cell(value)', () => {
    checkFields(new Cell(1), [1, true, false, 0, 0, false, false, false]);
  });

  test('Cell(() => some)', () => {
    checkFields(new Cell(() => 1), [undefined, false, false, 0, 0, false, false, false]);
  });

  test('a[fn] -> b[constant]', () => {
    const a = new Cell(() => b.get());
    const b = new Cell(1);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [1, true, false, 0, 0, false, false, false]);

    expect(a.get()).eq(1);
    checkFields(a, [1, false, false, 1, 0, false, false, false]);
    checkFields(b, [1, true, false, 0, 0, false, false, false]);

    b.set(4);
    checkFields(a, [1, false, false, 1, 0, false, false, false]);
    checkFields(b, [4, true, false, 0, 0, false, false, false]);

    expect(a.get()).eq(4);
    checkFields(a, [4, false, false, 1, 0, false, false, false]);
    checkFields(b, [4, true, false, 0, 0, false, false, false]);
  });

  test('a[fn] -> b[constant] + subscribe', async () => {
    const a = new Cell(() => b.get());
    const b = new Cell(1);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [1, true, false, 0, 0, false, false, false]);

    a.onChange(noop);
    checkFields(a, [1, true, true, 1, 0, true, true, false]);
    checkFields(b, [1, true, true, 0, 1, false, false, false]);

    b.set(4);
    actualizeScheduledCells();
    checkFields(a, [4, true, true, 1, 0, true, true, false]);
    checkFields(b, [4, true, true, 0, 1, false, false, false]);

    a.offChange(noop);
    checkFields(a, [4, false, false, 0, 0, false, false, false]);
    checkFields(b, [4, true, false, 0, 0, false, false, false]);

    a.onChange(noop);
    checkFields(a, [4, true, true, 1, 0, true, true, false]);
    checkFields(b, [4, true, true, 0, 1, false, false, false]);
  });

  test('a -> b ? m : c', () => {
    const a = new Cell(() => b.get() ? m.get() : c.get());
    const b = new Cell<any>(55);
    const m = new Cell(() => z.get());
    const z = new Cell('hi');
    const c = new Cell(() => 1);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [55, true, false, 0, 0, false, false, false]);
    checkFields(m, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [undefined, false, false, 0, 0, false, false, false]);

    expect(a.get()).eq('hi');
    checkFields(a, ['hi', false, false, 2, 0, false, false, false]);
    checkFields(b, [55, true, false, 0, 0, false, false, false]);
    checkFields(m, ['hi', false, false, 1, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [undefined, false, false, 0, 0, false, false, false]);

    b.set(null);
    checkFields(a, ['hi', false, false, 2, 0, false, false, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [null, true, false, 0, 0, false, false, false]);
    checkFields(m, ['hi', false, false, 1, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [undefined, false, false, 0, 0, false, false, false]);

    expect(a.get()).eq(1);
    checkFields(a, [1, false, false, 2, 0, false, false, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(c)).True();
    checkFields(b, [null, true, false, 0, 0, false, false, false]);
    checkFields(m, ['hi', false, false, 1, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);
  });

  test('a -> b ? m : c + subscribed', async () => {
    const a = new Cell(() => b.get() ? m.get() : c.get());
    const b = new Cell<any>(55);
    const m = new Cell(() => z.get());
    const z = new Cell('hi');
    const c = new Cell(() => 1);
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(b, [55, true, false, 0, 0, false, false, false]);
    checkFields(m, [undefined, false, false, 0, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [undefined, false, false, 0, 0, false, false, false]);

    a.onChange(noop);
    checkFields(a, ['hi', true, true, 2, 0, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [55, true, true, 0, 1, false, false, false]);
    checkFields(m, ['hi', true, true, 1, 1, true, true, false]);
    checkFields(z, ['hi', true, true, 0, 1, false, false, false]);
    checkFields(c, [undefined, false, false, 0, 0, false, false, false]);

    b.set(null);
    actualizeScheduledCells();
    checkFields(a, [1, true, true, 2, 0, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(c)).True();
    checkFields(b, [null, true, true, 0, 1, false, false, false]);
    checkFields(m, ['hi', false, false, 0, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, true, 0, 1, false, false, false]);

    a.offChange(noop);
    checkFields(a, [1, false, false, 0, 0, false, false, false]);
    checkFields(b, [null, true, false, 0, 0, false, false, false]);
    checkFields(m, ['hi', false, false, 0, 0, false, false, false]);
    checkFields(z, ['hi', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    b.set(7);
    a.onChange(noop);
    checkFields(a, ['hi', true, true, 2, 0, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [7, true, true, 0, 1, false, false, false]);
    checkFields(m, ['hi', true, true, 1, 1, true, true, false]);
    checkFields(z, ['hi', true, true, 0, 1, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    z.set('world');
    actualizeScheduledCells();
    checkFields(a, ['world', true, true, 2, 0, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [7, true, true, 0, 1, false, false, false]);
    checkFields(m, ['world', true, true, 1, 1, true, true, false]);
    checkFields(z, ['world', true, true, 0, 1, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    a.offChange(noop);
    checkFields(a, ['world', false, false, 0, 0, false, false, false]);
    checkFields(b, [7, true, false, 0, 0, false, false, false]);
    checkFields(m, ['world', false, false, 0, 0, false, false, false]);
    checkFields(z, ['world', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    a.onChange(noop);
    checkFields(a, ['world', true, true, 2, 0, true, true, false]);
    expect(a.dependencies.has(b)).True();
    expect(a.dependencies.has(m)).True();
    checkFields(b, [7, true, true, 0, 1, false, false, false]);
    checkFields(m, ['world', true, true, 1, 1, true, true, false]);
    checkFields(z, ['world', true, true, 0, 1, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);

    a.offChange(noop);
    checkFields(a, ['world', false, false, 0, 0, false, false, false]);
    checkFields(b, [7, true, false, 0, 0, false, false, false]);
    checkFields(m, ['world', false, false, 0, 0, false, false, false]);
    checkFields(z, ['world', true, false, 0, 0, false, false, false]);
    checkFields(c, [1, true, false, 0, 0, false, false, false]);
  });

});
