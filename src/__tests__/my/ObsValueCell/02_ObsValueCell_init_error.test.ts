import {createObsArray, createObsMap, EventEmitter} from '@do-while-for-each/common';
import {noThrow, Throw} from '@do-while-for-each/test';
import {ObsValueCell} from '../../..';

const errMessage = 'ObsValueCell can only be initiated by an ObsValueLike';

describe('02_ObsValueCell_init_error', () => {

  test('check Throw', () => {
    Throw(() => new ObsValueCell(123 as any), errMessage);
  });

  test('check Throw', () => {
    Throw(() => new ObsValueCell({} as any), errMessage);
  });

  test('check Throw', () => {
    Throw(() => new ObsValueCell(null as any), errMessage);
  });

  test('check noThrow for EventEmitter', () => {
    noThrow(() => new ObsValueCell(new EventEmitter<{ change: any }>()));
  });

  test('check noThrow for ObsArray', () => {
    noThrow(() => new ObsValueCell(createObsArray()));
  });

  test('check noThrow for ObsMap', () => {
    noThrow(() => new ObsValueCell(createObsMap()));
  });

});
