import {noop} from '@do-while-for-each/common';
import {EventChangeListenerParam, ICellOpt} from '../contract';
import {IChangeHandler, IRunnersDispose} from './contract';
import {Cell} from '../cell/Cell';

export function autorun<TValue = any>(
  runFn: () => TValue,
  opt: IAutorunOpt<TValue> = {}
): IRunnersDispose<TValue> {

  const rootCell = new Cell(runFn, opt.rootCellOpt);
  const dispose: IRunnersDispose = (): void => {
    rootCell.dispose();
  };
  dispose.rootCell = rootCell;

  const onChange = opt.onChange
    ? getChangeHandler(opt.onChange)
    : getChangeHandlerDefault();


  if (opt.skipInitResult) {
    rootCell.onChange(noop); // initialize the cell tree inside noop
  }
  rootCell.onChange(onChange);

  if (opt.skipInitResult) {
    rootCell.offChange(noop);
  }

  return dispose;
}


export interface IAutorunOpt<TValue> {
  onChange?: IChangeHandler<TValue>;
  skipInitResult?: boolean;
  rootCellOpt?: ICellOpt<TValue>;
  debugId?: string;
}

const getChangeHandler = (onChange: IChangeHandler): any =>
  (change: EventChangeListenerParam) => {
    if (change.error) {
      console.error('AUTORUN', change.error.message);
      return;
    }
    onChange(change.value, change.oldValue, change.error);
  }
;

const getChangeHandlerDefault = (): any =>
  (change: EventChangeListenerParam) => {
    if (change.error)
      console.error('AUTORUN', change.error.message);
  }
;
