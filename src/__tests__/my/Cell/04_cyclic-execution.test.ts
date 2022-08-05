import {Throw} from '@do-while-for-each/test';
import {Cell} from '../../..';

const errMessage = 'cyclic execution of cell.fn was detected';

describe('04_cyclic-execution', () => {

  test('class field', () => {
    class Check {
      $state = new Cell(() => this.state);

      get state() {
        return this.$state.get();
      }
    }

    const check = new Check();
    Throw(() => check.$state.get(), errMessage);
    Throw(() => check.state, errMessage);
  });

  test('just cell #1', () => {
    const a = new Cell(1);
    const b = new Cell(() => a.get() + b.get());
    Throw(() => b.get(), errMessage);
  });

  test('just cell #2', () => {
    const a = new Cell(() => b.get());
    const b = new Cell(() => a.get());
    Throw(() => b.get(), errMessage);
  });

  test('just cell #3', () => {
    const a = new Cell(() => c.get());
    const b = new Cell(() => a.get());
    const c = new Cell(() => b.get());
    Throw(() => b.get(), errMessage);
  });

});
