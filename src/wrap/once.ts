import {noop} from '@do-while-for-each/common';
import {EventChangeListenerParam, ICellOpt} from '../contract';
import {IRunnersDispose} from './contract';
import {Cell} from '../cell/Cell';

export function once<TValue = any>(
  runFn: () => TValue,
  opt: IOnceOpt<TValue>
): IRunnersDispose {

  const rootCell = new Cell(runFn, opt.rootCellOpt);
  const dispose: IRunnersDispose = (): void => {
    rootCell.dispose();
  };
  dispose.rootCell = rootCell;

  if (opt.skipInitResult) {
    rootCell.onChange(noop); // initialize the cell tree inside noop
  }

  rootCell.onChange(
    (change: EventChangeListenerParam) => {
      if (change.error) {
        console.error('ONCE', change.error.message);
        return;
      }
      if (opt.filter(change.value))
        setTimeout(() => {
          dispose(); // фильтр может сработать в процессе первой актуализации. Надо изолировать dispose от этого процесса и лучше это сделать в макротаске
          setTimeout(() => opt.action(), 0); // на всякий случай
        }, 0);
    }
  );

  if (opt.skipInitResult) {
    rootCell.offChange(noop);
  }

  return dispose;
}

export interface IOnceOpt<TValue> {
  filter: (value: TValue) => boolean;
  action: () => void; // action будет вызван, если фильтр вернул true
  skipInitResult?: boolean;
  rootCellOpt?: ICellOpt<TValue>;
}
