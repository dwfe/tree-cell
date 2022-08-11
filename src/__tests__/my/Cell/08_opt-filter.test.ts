import { Throw } from '@do-while-for-each/test';
import {Cell} from '../../..';

describe('08_opt-filter', () => {

  test('init', () => {
    {
      const a = new Cell(10, {filter: (x) => x > 5});
      expect(a.get()).eq(10);
    }
    {
      const a = new Cell(5, {filter: (x) => x > 5});
      Throw(() => a.get(), 'Cell did not accept value: 5');
    }
  });

});
