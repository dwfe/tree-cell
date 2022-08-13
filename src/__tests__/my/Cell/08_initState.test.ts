import {Throw} from '@do-while-for-each/test';
import {checkFields} from '../../util';
import {Cell} from '../../..';

describe('08_initState', () => {

  test('fn', () => {
    const a = new Cell(() => 7);
    expect(!!a.fn).True();
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
  });

  test('fn, filter does not affect the function', () => {
    const a = new Cell(() => 7, {filter: (x) => x > 10});
    expect(!!a.fn).True();
    checkFields(a, [undefined, false, false, 0, 0, false, false, false]);
  });

  test('value', () => {
    const a = new Cell(10);
    expect(a.fn).eq(undefined);
    checkFields(a, [10, true, false, 0, 0, false, false, false]);
    expect(a.get()).eq(10);
  });

  test('filter passed value', () => {
    const a = new Cell(7, {filter: (x) => x > 5});
    expect(a.fn).eq(undefined);
    checkFields(a, [7, true, false, 0, 0, false, false, false]);
    expect(a.get()).eq(7);
  });

  test('filter blocked value', () => {
    const a = new Cell(3, {filter: (x) => x > 5});
    expect(a.fn).eq(undefined);
    checkFields(a, [undefined, true, false, 0, 0, false, false, 'Cell did not accept value: 3']);
    Throw(() => a.get(), 'Cell did not accept value: 3');
  });

});
