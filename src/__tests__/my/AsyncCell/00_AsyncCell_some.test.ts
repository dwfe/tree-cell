import {noop} from '@do-while-for-each/test';
import {AsyncCell, Cell} from '../../..';

describe('00_AsyncCell_some', () => {

  test('isDataCell', () => {
    const rootCell = new Cell(() => asyncCell.get());
    const asyncCell = new AsyncCell(() => new Promise(resolve => resolve(123)));
    expect(asyncCell.isDataCell).True();
    rootCell.onChange(noop);
    expect(asyncCell.isDataCell).True();
    rootCell.offChange(noop);
    expect(asyncCell.isDataCell).True();
  });

});
