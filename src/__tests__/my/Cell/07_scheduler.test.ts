import {noop, Throw} from '@do-while-for-each/test';
import {actualizeScheduledCells, Cell} from '../../..';
import {isCellScheduled} from '../../../sheduler';

describe('07_scheduler', () => {

  test('cyclic actualize of scheduled cells was detected', () => {
    const a = new Cell(() => {
      b.get();
      actualizeScheduledCells();
    });
    const b = new Cell(1);
    a.onChange(noop);

    b.set(7);
    expect(a.isActual).False();
    expect(isCellScheduled(a)).True();
    actualizeScheduledCells();
    Throw(() => a.get(), 'cyclic actualize of scheduled cells was detected');
  });

});
