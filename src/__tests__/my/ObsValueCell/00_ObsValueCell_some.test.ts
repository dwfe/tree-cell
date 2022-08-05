import {createObsMap} from '@do-while-for-each/common';
import {noop} from '@do-while-for-each/test';
import {Cell, ObsValueCell} from '../../..';

describe('00_ObsValueCell_some', () => {

  test('isDataCell', () => {
    const rootCell = new Cell(() => mapCell.get());
    const mapCell = new ObsValueCell(createObsMap());
    expect(mapCell.isDataCell).True();
    rootCell.onChange(noop);
    expect(mapCell.isDataCell).True();
    rootCell.offChange(noop);
    expect(mapCell.isDataCell).True();
  });

});
