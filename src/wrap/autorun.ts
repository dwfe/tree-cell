import {Listener, noop} from '@do-while-for-each/common';
import {EventChangeListenerParam, ICellOpt} from '../contract';
import {Dispose} from './contract';
import {Cell} from '../cell/Cell';

export function autorun(runFn: () => void, opt: IOpt = {}): Dispose {
  const onChange = opt.onChange ?? onChangeDefault;

  const rootCell = new Cell(runFn, opt.rootCellOpt);

  if (opt.skipInitChange) {
    rootCell.onChange(noop); // initialize the cell tree inside noop
  }
  rootCell.onChange(onChange);

  rootCell.offChange(noop);

  const dispose: Dispose = (): void => {
    rootCell.offChange(onChange);
  };
  dispose.rootCell = rootCell;
  return dispose;
}


interface IOpt<TValue = any> {
  onChange?: Listener<EventChangeListenerParam<TValue>>;
  skipInitChange?: boolean;
  rootCellOpt?: ICellOpt<any>;
}

function onChangeDefault(change: EventChangeListenerParam): void {
  if (change.error)
    console.error('AUTORUN', change.error.message);
}
