import {Listener, noop} from '@do-while-for-each/common';
import {EventChangeListenerParamV2, ICellOpt} from '../contract';
import {Cell} from '../cell/Cell';

export function autorun<TValue = any>(
  runFn: () => TValue,
  opt: IAutorunOpt<TValue> = {}
): IAutorunDispose<TValue> {

  const onChange = opt.onChange ?? onChangeDefault;
  const rootCell = new Cell(runFn, opt.rootCellOpt);

  if (opt.skipInitChange) {
    rootCell.onChange(noop); // initialize the cell tree inside noop
  }
  rootCell.onChange(onChange as any);
  rootCell.offChange(noop);

  const dispose: IAutorunDispose = (): void => rootCell.dispose();
  dispose.rootCell = rootCell;
  return dispose;
}


export interface IAutorunOpt<TValue> {
  onChange?: Listener<EventChangeListenerParamV2<TValue>>;
  skipInitChange?: boolean;
  rootCellOpt?: ICellOpt<TValue>;
}

export interface IAutorunDispose<TValue = any> {
  (): void;

  rootCell: Cell<TValue>;
}


function onChangeDefault(change: EventChangeListenerParamV2): void {
  if (change.error)
    console.error('AUTORUN', change.error.message);
}
