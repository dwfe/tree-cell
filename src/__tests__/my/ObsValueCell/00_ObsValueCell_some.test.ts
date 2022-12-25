import {createObsMap, IObsMap} from '@do-while-for-each/common';
import {noop} from '@do-while-for-each/test';
import {actualizeScheduledCells, autorun, Cell, getCachedCell, ICell, makeObservable, obsValueCell, ObsValueCell} from '../../..';
import {checkFields} from '../../util';

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

  test('value.dispose() on autorunRootCell.dispose()', () => {
    const map = createObsMap<string, number>();

    class Check {
      cache = map;

      constructor() {
        makeObservable(this, {
          cache: obsValueCell,
        });
      }
    }

    let runCount = 0;
    let runMapChangeCount = 0;
    let mapCellValueData: any;
    const obj = new Check();
    const mapCell = getCachedCell(obj, 'cache') as ICell;
    const mapCellValue = mapCell.value as IObsMap<string, number>;
    const onChangeMap = (data) => {
      runMapChangeCount++;
      mapCellValueData = data;
    };

    expect(mapCellValue).eq(map);
    expect(mapCellValue.hasListeners).False();
    expect(mapCellValueData).eq(undefined);
    checkFields(mapCell, [map, true, false, 0, 0, false, false, false]);

    const dispose = autorun(() => {
      runCount++;
      obj.cache;
    });

    expect(runCount).eq(1);
    expect(runMapChangeCount).eq(0);
    expect(mapCellValue.numberOfListeners()).eq(1);
    checkFields(mapCell, [map, true, true, 0, 1, false, false, false]);

    mapCellValue.onChange(onChangeMap);
    expect(runMapChangeCount).eq(0);
    expect(mapCellValue.numberOfListeners()).eq(2);
    expect(mapCellValueData).eq(undefined);

    obj.cache.set('one', 1);
    expect(runCount).eq(1);
    expect(runMapChangeCount).eq(1);
    expect(mapCellValue.numberOfListeners()).eq(2);
    expect(mapCellValueData.type).eq('add');
    expect(mapCellValueData.key).eq('one');
    expect(mapCellValueData.value).eq(1);

    actualizeScheduledCells();
    expect(runCount).eq(2);
    expect(runMapChangeCount).eq(1);
    expect(mapCellValue.hasListeners).True();

    dispose();
    expect(runCount).eq(2);
    expect(runMapChangeCount).eq(1);
    expect(mapCellValue.hasListeners).False();
    checkFields(mapCell, [map, true, false, 0, 0, false, false, false]);
  });

});
