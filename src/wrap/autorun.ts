import {Listener, noop} from '@do-while-for-each/common';
import {EventChangeListenerParam, ICellOpt} from '../contract';
import {IAutorunDispose} from './contract';
import {Cell} from '../cell/Cell';

export function autorun<TValue = any>(
  runFn: () => TValue,
  opt: IAutorunOpt<TValue> = {}
): IAutorunDispose {

  const onChange = opt.onChange ?? onChangeDefault;

  const rootCell = new Cell<TValue>(runFn, opt.rootCellOpt);

  if (opt.skipInitChange) {
    rootCell.onChange(noop); // initialize the cell tree inside noop
  }
  rootCell.onChange(onChange);

  rootCell.offChange(noop);

  const dispose: IAutorunDispose = (): void => {
    rootCell.dispose();
  };
  dispose.rootCell = rootCell;
  return dispose;
}


export interface IAutorunOpt<TValue = any> {
  onChange?: Listener<EventChangeListenerParam<TValue>>;
  skipInitChange?: boolean;
  rootCellOpt?: ICellOpt<any>;
}

function onChangeDefault(change: EventChangeListenerParam): void {
  if (change.error)
    console.error('AUTORUN', change.error.message);
}
