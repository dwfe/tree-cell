import {noop, Throw} from '@do-while-for-each/test';
import {actualizeScheduledCells, Cell} from '../../..';
import {isCellScheduled} from '../../../scheduler';

describe('07_scheduler', () => {

  test('cyclic actualize of scheduled cells was detected', () => {
    const a = new Cell(() => {
      b.get();                         // (2) В процессе актуализации a второй раз добавить a в очередь для актуализации
      actualizeScheduledCells(); // <- // (3) Вот тут и возникнет зацикливание, т.к.:
    });                                //      1. Одна из зависимостей a изменилась в процессе того,
    const b = new Cell(1);             //         как a пыталась актуализироваться.
    a.onChange(noop);                  //      2.

    b.set(7);                          // (1) Добавить a в очередь для актуализации
    expect(a.isActual).False();
    expect(isCellScheduled(a)).True();
    actualizeScheduledCells();
    expect(a.isActual).True();
    Throw(() => a.get(), 'cyclic actualize of scheduled cells was detected');
  });

  // test('ew', () => {
  //   const b = new Cell(1);
  //   const dispose = autorun(() => {
  //     return b.get();
  //   });
  //   const {rootCell} = dispose;
  //   b.set(7);
  //   expect(rootCell.isActual).False();
  //   expect(isCellScheduled(rootCell)).True();
  //   rootCell.get();
  // });

});
